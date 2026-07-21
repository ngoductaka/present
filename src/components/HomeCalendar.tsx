import { Ionicons } from '@expo/vector-icons';
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
import { toLocalDateKey } from '../utils/date';

const MIN_MOOD_SCORE = 1;
const MAX_MOOD_SCORE = 5;
const TREND_CHART_HEIGHT = 92;
const TREND_DRAWABLE_HEIGHT = 64;
const TREND_POINT_SIZE = 10;

type HomeCalendarProps = {
  locale: string;
  entryDates?: string[];
  moodByDate?: Partial<Record<string, MoodType>>;
  emotionByDate?: Partial<Record<string, DiaryEmotion>>;
  diaryImagesByDate?: Partial<Record<string, string[]>>;
  onDatePress?: (date: string) => void;
};

const getLocaleConfig = (locale: string) => {
  const referenceDate = new Date(Date.UTC(2024, 0, 7));
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(
      new Date(2024, index, 1),
    ),
  );
  const monthNamesShort = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { month: 'short' }).format(
      new Date(2024, index, 1),
    ),
  );
  const dayNames = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
      new Date(referenceDate.getTime() + index * 24 * 60 * 60 * 1000),
    ),
  );
  const dayNamesShort = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      new Date(referenceDate.getTime() + index * 24 * 60 * 60 * 1000),
    ),
  );

  return {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
      new Date(),
    ),
  };
};

const getTrendPointColor = (score: number) => {
  if (score >= 4) {
    return '#e97ca8';
  }

  if (score >= 3) {
    return '#d7a3ba';
  }

  return '#b85b83';
};

export const HomeCalendar = ({
  locale,
  entryDates = [],
  moodByDate = {},
  emotionByDate = {},
  diaryImagesByDate = {},
  onDatePress,
}: HomeCalendarProps) => {
  const { t } = useLanguage();
  const today = React.useMemo(() => new Date(), []);
  const todayString = React.useMemo(() => toLocalDateKey(today), [today]);
  const [selectedDate, setSelectedDate] = React.useState(todayString);
  const [visibleMonthKey, setVisibleMonthKey] = React.useState(
    todayString.slice(0, 7),
  );
  const [trendChartWidth, setTrendChartWidth] = React.useState(0);
  const daysInSelectedMonth = React.useMemo(() => {
    const [year, month] = visibleMonthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [visibleMonthKey]);
  const selectedMood = moodByDate[selectedDate];
  const selectedMoodOption = selectedMood
    ? MOOD_OPTIONS.find((option) => option.type === selectedMood)
    : null;
  const selectedEmotion = emotionByDate[selectedDate];
  const selectedEmotionOption = selectedEmotion
    ? DIARY_EMOTION_OPTIONS.find((option) => option.id === selectedEmotion)
    : null;
  const selectedImages = (diaryImagesByDate[selectedDate] ?? []).slice(0, 2);
  const selectedDateLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date(`${selectedDate}T00:00:00`)),
    [locale, selectedDate],
  );
  const selectedMonthLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${visibleMonthKey}-01T00:00:00`)),
    [locale, visibleMonthKey],
  );
  const monthlyEmotionStats = React.useMemo(() => {
    const counts = new Map<DiaryEmotion, number>();
    const allDates = new Set([
      ...Object.keys(moodByDate),
      ...Object.keys(emotionByDate),
    ]);

    allDates.forEach((dateKey) => {
      if (!dateKey.startsWith(visibleMonthKey)) {
        return;
      }

      const emotionId = moodByDate[dateKey] ?? emotionByDate[dateKey];
      if (!emotionId) {
        return;
      }

      counts.set(emotionId, (counts.get(emotionId) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([emotionId, count]) => {
        const moodOption = MOOD_OPTIONS.find(
          (option) => option.type === emotionId,
        );
        const diaryOption = DIARY_EMOTION_OPTIONS.find(
          (option) => option.id === emotionId,
        );

        if (!moodOption && !diaryOption) {
          return null;
        }

        return {
          id: emotionId,
          count,
          image: moodOption?.image ?? diaryOption?.image,
          label: moodOption
            ? t(`mood.${moodOption.type}`)
            : t(diaryOption!.labelKey),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [emotionByDate, moodByDate, t, visibleMonthKey]);
  const maxMonthlyEmotionCount = monthlyEmotionStats[0]?.count ?? 0;
  const monthlyBalance = React.useMemo(() => {
    const scoreByMood = new Map(
      MOOD_OPTIONS.map((option) => [option.type, option.score]),
    );
    let good = 0;
    let neutral = 0;
    let bad = 0;

    Object.keys({ ...moodByDate, ...emotionByDate }).forEach((dateKey) => {
      if (!dateKey.startsWith(visibleMonthKey)) {
        return;
      }

      const emotionId = moodByDate[dateKey] ?? emotionByDate[dateKey];
      if (!emotionId) {
        return;
      }

      const score = scoreByMood.get(emotionId);
      if (!score) {
        return;
      }

      if (score >= 4) {
        good += 1;
      } else if (score <= 2) {
        bad += 1;
      } else {
        neutral += 1;
      }
    });

    const total = good + neutral + bad;

    return {
      good,
      neutral,
      bad,
      total,
      goodPercent: total > 0 ? Math.round((good / total) * 100) : 0,
      neutralPercent: total > 0 ? Math.round((neutral / total) * 100) : 0,
      badPercent: total > 0 ? Math.round((bad / total) * 100) : 0,
    };
  }, [emotionByDate, moodByDate, visibleMonthKey]);
  const monthlyTrendPoints = React.useMemo(() => {
    const scoreByMood = new Map(
      MOOD_OPTIONS.map((option) => [option.type, option.score]),
    );
    const xRange = Math.max(trendChartWidth - TREND_POINT_SIZE, 0);

    return Array.from({ length: daysInSelectedMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = `${visibleMonthKey}-${String(day).padStart(2, '0')}`;
      const emotionId = moodByDate[dateKey] ?? emotionByDate[dateKey];

      if (!emotionId) {
        return null;
      }

      const score = scoreByMood.get(emotionId);
      if (!score) {
        return null;
      }

      const x =
        daysInSelectedMonth === 1
          ? xRange / 2
          : (index / (daysInSelectedMonth - 1)) * xRange;
      const normalizedScore =
        (MAX_MOOD_SCORE - score) / (MAX_MOOD_SCORE - MIN_MOOD_SCORE);
      const y = 12 + normalizedScore * TREND_DRAWABLE_HEIGHT;

      return {
        day,
        dateKey,
        score,
        x,
        y,
        color: getTrendPointColor(score),
      };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [
    daysInSelectedMonth,
    emotionByDate,
    moodByDate,
    trendChartWidth,
    visibleMonthKey,
  ]);
  const monthlyTrendSegments = React.useMemo(
    () =>
      monthlyTrendPoints.slice(0, -1).map((point, index) => {
        const nextPoint = monthlyTrendPoints[index + 1];
        const pointCenterX = point.x + TREND_POINT_SIZE / 2;
        const pointCenterY = point.y + TREND_POINT_SIZE / 2;
        const nextPointCenterX = nextPoint.x + TREND_POINT_SIZE / 2;
        const nextPointCenterY = nextPoint.y + TREND_POINT_SIZE / 2;
        const deltaX = nextPointCenterX - pointCenterX;
        const deltaY = nextPointCenterY - pointCenterY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
        const centerX = (pointCenterX + nextPointCenterX) / 2;
        const centerY = (pointCenterY + nextPointCenterY) / 2;

        return {
          key: `${point.dateKey}-${nextPoint.dateKey}`,
          left: centerX - length / 2,
          top: centerY - 1.5,
          width: length,
          angle,
        };
      }),
    [monthlyTrendPoints],
  );

  const handleDayPress = React.useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      setVisibleMonthKey(dateString.slice(0, 7));
      onDatePress?.(dateString);
    },
    [onDatePress],
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
        onMonthChange={(month) => {
          setVisibleMonthKey(
            `${month.year}-${String(month.month).padStart(2, '0')}`,
          );
        }}
        maxDate={todayString}
        markedDates={{
          [todayString]: {
            selected: false,
          },
          ...(selectedDate !== todayString
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#d45c8f',
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
              style={styles.dayContainer}
              onPress={() => handleDayPress(date.dateString)}
              disabled={isDisabled}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dayText,
                  hasMoodVisual && styles.dayTextWithMood,
                  isDisabled && styles.disabledDayText,
                  isToday && styles.todayDayText,
                ]}
              >
                {date.day}
              </Text>
              {moodOption ? (
                <Image
                  source={moodOption.image}
                  style={styles.moodBadge}
                  resizeMode='contain'
                />
              ) : diaryEmotionOption ? (
                <Image
                  source={diaryEmotionOption.image}
                  style={styles.emotionBadge}
                  resizeMode='contain'
                />
              ) : null}
            </TouchableOpacity>
          );
        }}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'rgba(255, 255, 255, 0.5)',
          textSectionTitleColor: '#607d8b',
          monthTextColor: '#263238',
          textMonthFontSize: 20,
          textMonthFontWeight: '700',
          dayTextColor: '#31454f',
          textDisabledColor: 'rgba(49, 69, 79, 0.28)',
          todayTextColor: '#d45c8f',
          // selectedDayBackgroundColor: '#d45c8f',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#d45c8f',
          textDayFontSize: 14,
          textDayFontWeight: '600',
          textDayHeaderFontSize: 12,
          textDayHeaderFontWeight: '700',
        }}
      />
      {selectedMoodOption ||
      selectedEmotionOption ||
      selectedImages.length > 0 ? (
        <TouchableOpacity
          style={styles.detailCard}
          onPress={handleDetailPress}
          activeOpacity={0.85}
        >
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>{selectedDateLabel}</Text>
            <View style={styles.editIconWrap}>
              <Ionicons name='create-outline' size={18} color='#d45c8f' />
            </View>
          </View>
          {selectedMoodOption || selectedEmotionOption ? (
            <View style={styles.detailRow}>
              {selectedMoodOption ? (
                <Image
                  source={selectedMoodOption.image}
                  style={styles.detailMoodImage}
                  resizeMode='contain'
                />
              ) : (
                <Image
                  source={selectedEmotionOption?.image}
                  style={styles.detailEmotionImage}
                  resizeMode='contain'
                />
              )}
              <Text style={styles.detailText}>
                {selectedMoodOption
                  ? t(`mood.${selectedMoodOption.type}`)
                  : selectedEmotionOption
                    ? t(selectedEmotionOption.labelKey)
                    : ''}
              </Text>
            </View>
          ) : null}
          {selectedImages.length > 0 ? (
            <View style={styles.detailImagesRow}>
              {selectedImages.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  style={styles.detailPreviewImage}
                />
              ))}
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}
      {monthlyEmotionStats.length > 0 ? (
        <View style={styles.chartCard}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={styles.chartTitle}>
              {t('logMood.monthlyEmotionSubtitle')}
            </Text>
            <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
          </View>
          <View style={styles.chartList}>
            {monthlyEmotionStats.map((item) => (
              <View key={item.id} style={styles.chartRow}>
                <View style={styles.chartLabelWrap}>
                  <Image
                    source={item.image}
                    style={styles.chartEmotionImage}
                    resizeMode='contain'
                  />
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        width: `${Math.max(
                          16,
                          Math.round(
                            (item.count / maxMonthlyEmotionCount) * 100,
                          ),
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {monthlyBalance.total > 0 ? (
        <View style={styles.chartCard}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
          <Text style={styles.chartTitle}>{t('logMood.balanceTitle')}</Text>
          <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
          </View>
          <View style={styles.balanceSummaryRow}>
            <View style={styles.balanceSummaryItem}>
              <Text style={[styles.balancePercent, styles.balancePercentGood]}>
                {monthlyBalance.goodPercent}%
              </Text>
              <Text style={styles.balanceLabel}>
                {t('logMood.balanceGood')}
              </Text>
            </View>
            <View style={styles.balanceSummaryItem}>
              <Text style={[styles.balancePercent, styles.balancePercentBad]}>
                {monthlyBalance.badPercent}%
              </Text>
              <Text style={styles.balanceLabel}>{t('logMood.balanceBad')}</Text>
            </View>
          </View>
          <View style={styles.balanceBar}>
            <View
              style={[
                styles.balanceBarGood,
                { flex: monthlyBalance.good || 0 },
              ]}
            />
            <View
              style={[
                styles.balanceBarNeutral,
                { flex: monthlyBalance.neutral || 0 },
              ]}
            />
            <View
              style={[styles.balanceBarBad, { flex: monthlyBalance.bad || 0 }]}
            />
          </View>
          <View style={styles.balanceLegend}>
            <View style={styles.balanceLegendItem}>
              <View
                style={[styles.balanceLegendDot, styles.balanceLegendDotGood]}
              />
              <Text style={styles.balanceLegendText}>
                {t('logMood.balanceGood')} {monthlyBalance.good}
              </Text>
            </View>
            <View style={styles.balanceLegendItem}>
              <View
                style={[
                  styles.balanceLegendDot,
                  styles.balanceLegendDotNeutral,
                ]}
              />
              <Text style={styles.balanceLegendText}>
                {t('logMood.balanceNeutral')} {monthlyBalance.neutral}
              </Text>
            </View>
            <View style={styles.balanceLegendItem}>
              <View
                style={[styles.balanceLegendDot, styles.balanceLegendDotBad]}
              />
              <Text style={styles.balanceLegendText}>
                {t('logMood.balanceBad')} {monthlyBalance.bad}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
      {monthlyTrendPoints.length > 0 ? (
        <View style={styles.chartCard}>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
          <Text style={styles.chartTitle}>{t('logMood.moodFlowTitle')}</Text>
          <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
          </View>
          {/* <Text style={styles.chartSubtitle}>
            {t('logMood.moodFlowSubtitle')}
          </Text> */}
          <View style={styles.trendCardInner}>
            {/* <View style={styles.trendAxisLabels}>
              <Text style={styles.trendAxisLabel}>
                {t('logMood.moodFlowHigh')}
              </Text>
              <Text style={styles.trendAxisLabel}>
                {t('logMood.moodFlowLow')}
              </Text>
            </View> */}
            <View
              style={styles.trendChart}
              onLayout={(event) =>
                setTrendChartWidth(event.nativeEvent.layout.width)
              }
            >
              <View style={[styles.trendGuideLine, styles.trendGuideLineTop]} />
              <View
                style={[styles.trendGuideLine, styles.trendGuideLineMiddle]}
              />
              <View
                style={[styles.trendGuideLine, styles.trendGuideLineBottom]}
              />
              {trendChartWidth > 0
                ? monthlyTrendSegments.map((segment) => (
                    <View
                      key={segment.key}
                      style={[
                        styles.trendSegment,
                        {
                          left: segment.left,
                          top: segment.top,
                          width: segment.width,
                          transform: [{ rotate: `${segment.angle}deg` }],
                        },
                      ]}
                    />
                  ))
                : null}
              {trendChartWidth > 0
                ? monthlyTrendPoints.map((point) => (
                    <View
                      key={point.dateKey}
                      style={[
                        styles.trendPoint,
                        {
                          left: point.x,
                          top: point.y,
                          backgroundColor: point.color,
                        },
                      ]}
                    />
                  ))
                : null}
            </View>
            <View style={styles.trendDayLabels}>
              <Text style={styles.trendDayLabel}>1</Text>
              <Text style={styles.trendDayLabel}>
                {Math.ceil(daysInSelectedMonth / 2)}
              </Text>
              <Text style={styles.trendDayLabel}>{daysInSelectedMonth}</Text>
            </View>
          </View>
        </View>
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
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#31454f',
  },
  dayTextWithMood: {
    position: 'absolute',
    bottom: 0,
    fontSize: 10,
    fontWeight: '700',
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
    top: -5,
    alignSelf: 'center',
    width: 41,
    height: 41,
  },
  emotionBadge: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    width: 41,
    height: 41,
  },
  detailCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#73868a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  editIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 92, 143, 0.12)',
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
  detailEmotionImage: {
    width: 26,
    height: 26,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e4246',
  },
  detailImagesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  detailPreviewImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#e7ecec',
  },
  chartCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  chartEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7a8d90',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#274045',
  },
  chartSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6d8084',
  },
  chartList: {
    marginTop: 12,
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartLabelWrap: {
    width: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartEmotionImage: {
    width: 24,
    height: 24,
  },
  chartLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#355055',
  },
  chartBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#f2e3eb',
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#e38bb0',
  },
  chartCount: {
    minWidth: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#4d666b',
    textAlign: 'right',
  },
  balanceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 14,
  },
  balanceSummaryItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#fcf3f7',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  balancePercent: {
    fontSize: 24,
    fontWeight: '800',
  },
  balancePercentGood: {
    color: '#e16f9f',
  },
  balancePercentBad: {
    color: '#b85b83',
  },
  balanceLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6f8387',
    textTransform: 'uppercase',
  },
  balanceBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#f4e8ee',
    marginTop: 14,
  },
  balanceBarGood: {
    backgroundColor: '#ea87b0',
  },
  balanceBarNeutral: {
    backgroundColor: '#efbfd2',
  },
  balanceBarBad: {
    backgroundColor: '#c8678f',
  },
  balanceLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  balanceLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceLegendDotGood: {
    backgroundColor: '#ea87b0',
  },
  balanceLegendDotNeutral: {
    backgroundColor: '#efbfd2',
  },
  balanceLegendDotBad: {
    backgroundColor: '#c8678f',
  },
  balanceLegendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5c7377',
  },
  trendCardInner: {
    marginTop: 12,
  },
  trendAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  trendAxisLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7a8d90',
    textTransform: 'uppercase',
  },
  trendChart: {
    height: TREND_CHART_HEIGHT,
    borderRadius: 18,
    backgroundColor: '#fdf4f8',
    overflow: 'hidden',
    position: 'relative',
  },
  trendGuideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#efd8e3',
  },
  trendGuideLineTop: {
    top: 18,
  },
  trendGuideLineMiddle: {
    top: TREND_CHART_HEIGHT / 2,
  },
  trendGuideLineBottom: {
    bottom: 14,
  },
  trendSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: '#e2a0bd',
  },
  trendPoint: {
    position: 'absolute',
    width: TREND_POINT_SIZE,
    height: TREND_POINT_SIZE,
    borderRadius: TREND_POINT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  trendDayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  trendDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7a8d90',
  },
});
