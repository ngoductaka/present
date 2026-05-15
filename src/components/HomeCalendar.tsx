import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useLanguage } from '../context/LanguageContext';
import {
  DIARY_EMOTION_OPTIONS,
  DiaryEmotion,
  MoodType,
  MOOD_OPTIONS,
} from '../types';

type HomeCalendarProps = {
  locale: string;
  entryDates?: string[];
  moodByDate?: Partial<Record<string, MoodType>>;
  emotionByDate?: Partial<Record<string, DiaryEmotion>>;
  onDatePress?: (date: string) => void;
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

export const HomeCalendar = ({
  locale,
  entryDates = [],
  moodByDate = {},
  emotionByDate = {},
  onDatePress,
}: HomeCalendarProps) => {
  const { t } = useLanguage();
  const today = React.useMemo(() => new Date(), []);
  const todayString = React.useMemo(() => toDateString(today), [today]);
  const [selectedDate, setSelectedDate] = React.useState(todayString);
  const selectedMood = moodByDate[selectedDate];
  const selectedMoodOption = selectedMood
    ? MOOD_OPTIONS.find((option) => option.type === selectedMood)
    : null;
  const selectedEmotion = emotionByDate[selectedDate];
  const selectedEmotionOption = selectedEmotion
    ? DIARY_EMOTION_OPTIONS.find((option) => option.id === selectedEmotion)
    : null;
  const selectedDateLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date(`${selectedDate}T00:00:00`)),
    [locale, selectedDate]
  );

  const handleDayPress = React.useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);

      if (moodByDate[dateString] || emotionByDate[dateString]) {
        return;
      }

      onDatePress?.(dateString);
    },
    [emotionByDate, moodByDate, onDatePress]
  );

  const handleDetailPress = React.useCallback(() => {
    onDatePress?.(selectedDate);
  }, [onDatePress, selectedDate]);

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
        onDayPress={(day) => handleDayPress(day.dateString)}
        maxDate={todayString}
        markedDates={{
          [todayString]: {
            selected: false,
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
          const mood = moodByDate[date.dateString];
          const moodOption = mood
            ? MOOD_OPTIONS.find((option) => option.type === mood)
            : null;
          const diaryEmotion = emotionByDate[date.dateString];
          const diaryEmotionOption = diaryEmotion
            ? DIARY_EMOTION_OPTIONS.find((option) => option.id === diaryEmotion)
            : null;
          const hasMoodVisual = Boolean(moodOption || diaryEmotionOption);

          return (
            <TouchableOpacity
              style={[
                styles.dayContainer,
                isSelected && !isToday && styles.selectedDayContainer,
              ]}
              onPress={() => handleDayPress(date.dateString)}
              disabled={isDisabled}
              activeOpacity={0.85}
            >
              
              <Text
                style={[
                  styles.dayText,
                  hasMoodVisual && styles.dayTextWithMood,
                  isDisabled && styles.disabledDayText,
                  isSelected && !isToday && styles.selectedDayText,
                  isToday && styles.todayDayText,
                ]}
              >
                {date.day}
              </Text>
              {moodOption ? (
                <Image
                  source={moodOption.image}
                  style={styles.moodBadge}
                  resizeMode="contain"
                />
              ) : diaryEmotionOption ? (
                <Text style={styles.emotionBadge}>{diaryEmotionOption.emoji}</Text>
              ) : null}
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
      {selectedMoodOption || selectedEmotionOption ? (
        <TouchableOpacity
          style={styles.detailCard}
          onPress={handleDetailPress}
          activeOpacity={0.85}
        >
          <Text style={styles.detailDate}>{selectedDateLabel}</Text>
          <View style={styles.detailRow}>
            {selectedMoodOption ? (
              <Image
                source={selectedMoodOption.image}
                style={styles.detailMoodImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.detailEmoji}>{selectedEmotionOption?.emoji}</Text>
            )}
            <Text style={styles.detailText}>
              {selectedMoodOption
                ? t(`mood.${selectedMoodOption.type}`)
                : selectedEmotionOption
                  ? t(selectedEmotionOption.labelKey)
                  : ''}
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}
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
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#31454f',
  },
  dayTextWithMood: {
    position: 'absolute',
    bottom: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayDayText: {
    color: '#d73a49',
    fontWeight: '800',
  },
  disabledDayText: {
    color: 'rgba(49, 69, 79, 0.28)',
  },
  moodBadge: {
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
    width: 24,
    height: 24,
  },
  emotionBadge: {
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
    fontSize: 21,
    lineHeight: 24,
  },
  detailCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#73868a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  detailMoodImage: {
    width: 26,
    height: 26,
  },
  detailEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e4246',
  },
});
