import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

type HomeCalendarProps = {
  locale: string;
};

const getLocaleConfig = (locale: string) => {
  const referenceDate = new Date(Date.UTC(2024, 0, 7));
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, index, 1))
  );
  const monthNamesShort = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, index, 1))
  );
  const dayNames = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
      new Date(referenceDate.getTime() + index * 24 * 60 * 60 * 1000)
    )
  );
  const dayNamesShort = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      new Date(referenceDate.getTime() + index * 24 * 60 * 60 * 1000)
    )
  );

  return {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date()),
  };
};

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

export const HomeCalendar = ({ locale }: HomeCalendarProps) => {
  const today = React.useMemo(() => new Date(), []);
  const todayString = React.useMemo(() => toDateString(today), [today]);
  const [selectedDate, setSelectedDate] = React.useState(todayString);

  React.useEffect(() => {
    const localeKey = locale.replace(/[^a-zA-Z0-9]/g, '-');
    LocaleConfig.locales[localeKey] = getLocaleConfig(locale);
    LocaleConfig.defaultLocale = localeKey;
  }, [locale]);

  return (
    <View style={styles.card}>
      <Calendar
        initialDate={todayString}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [todayString]: {
            marked: true,
            dotColor: '#1f6f78',
            ...(selectedDate === todayString
              ? { selected: true, selectedColor: '#1f6f78' }
              : {}),
          },
          ...(selectedDate !== todayString
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#1f6f78',
                },
              }
            : {}),
        }}
        enableSwipeMonths
        hideExtraDays
        firstDay={1}
        style={styles.calendar}
        dayComponent={({ date, state }) => {
          if (!date) {
            return <View style={styles.dayContainer} />;
          }

          const isSelected = date.dateString === selectedDate;
          const isToday = date.dateString === todayString;
          const isDisabled = state === 'disabled';

          return (
            <TouchableOpacity
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDayContainer,
                isToday && !isSelected && styles.todayDayContainer,
              ]}
              onPress={() => setSelectedDate(date.dateString)}
              disabled={isDisabled}
              activeOpacity={0.85}
            >
              {isToday ? <Ionicons
                  name={isSelected ? 'sparkles' : 'bookmark'}
                  size={18}
                  color={isSelected ? '#ffffff' : '#1f6f78'}
                  // style={styles.dayIcon}
                />: null}
              <Text
                style={[
                  styles.dayText,
                  isDisabled && styles.disabledDayText,
                  isSelected && styles.selectedDayText,
                  isToday && !isSelected && styles.todayDayText,
                  // { fontSize: 10, fontWeight: '600' },
                ]}
              >
                {date.day}
              </Text>
              {/* {(isSelected || isToday) && (
                <Ionicons
                  name={isSelected ? 'sparkles' : 'bookmark'}
                  size={10}
                  color={isSelected ? '#ffffff' : '#1f6f78'}
                  style={styles.dayIcon}
                />
              )} */}
            </TouchableOpacity>
          );
        }}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: '#607d8b',
          monthTextColor: '#263238',
          textMonthFontSize: 20,
          textMonthFontWeight: '700',
          dayTextColor: '#31454f',
          textDisabledColor: 'rgba(49, 69, 79, 0.28)',
          todayTextColor: '#1f6f78',
          selectedDayBackgroundColor: '#1f6f78',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#1f6f78',
          textDayFontSize: 14,
          textDayFontWeight: '600',
          textDayHeaderFontSize: 12,
          textDayHeaderFontWeight: '700',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 12,
    // borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    // borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    // backgroundColor: 'red',
  },
  calendar: {
    borderRadius: 20,
    paddingBottom: 8,
  },
  dayContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDayContainer: {
    backgroundColor: '#1f6f78',
  },
  todayDayContainer: {
    backgroundColor: 'rgba(31, 111, 120, 0.12)',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#31454f',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayDayText: {
    color: '#1f6f78',
  },
  disabledDayText: {
    color: 'rgba(49, 69, 79, 0.28)',
  },
});
