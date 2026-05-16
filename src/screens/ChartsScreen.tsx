import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { getDiaryEmotionByDate } from '../services/diaryService';
import { getLatestMoodByDate } from '../services/moodService';
import { DIARY_EMOTION_OPTIONS, DiaryEmotion, MoodType, MOOD_OPTIONS } from '../types';
import { toLocalMonthKey } from '../utils/date';

const backgroundImage = require('../../assets/bg1.jpg');
const MIN_MOOD_SCORE = 1;
const MAX_MOOD_SCORE = 5;
const TREND_CHART_HEIGHT = 92;
const TREND_DRAWABLE_HEIGHT = 64;
const TREND_POINT_SIZE = 10;

type ChartsScreenProps = NativeStackScreenProps<RootStackParamList, 'Charts'>;

const getTrendPointColor = (score: number) => {
  if (score >= 4) {
    return '#e97ca8';
  }

  if (score >= 3) {
    return '#d7a3ba';
  }

  return '#b85b83';
};

export const ChartsScreen = ({ navigation }: ChartsScreenProps) => {
  const { t, locale } = useLanguage();
  const today = React.useMemo(() => new Date(), []);
  const currentMonthKey = React.useMemo(() => toLocalMonthKey(today), [today]);
  const [visibleMonthKey, setVisibleMonthKey] = React.useState(currentMonthKey);
  const [loading, setLoading] = React.useState(true);
  const [trendChartWidth, setTrendChartWidth] = React.useState(0);
  const [moodByDate, setMoodByDate] = React.useState<Partial<Record<string, MoodType>>>({});
  const [emotionByDate, setEmotionByDate] = React.useState<
    Partial<Record<string, DiaryEmotion>>
  >({});

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadChartData = async () => {
        try {
          const [moods, emotions] = await Promise.all([
            getLatestMoodByDate(),
            getDiaryEmotionByDate(),
          ]);

          if (isActive) {
            setMoodByDate(moods);
            setEmotionByDate(emotions);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      void loadChartData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const daysInSelectedMonth = React.useMemo(() => {
    const [year, month] = visibleMonthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [visibleMonthKey]);

  const selectedMonthLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${visibleMonthKey}-01T00:00:00`)),
    [locale, visibleMonthKey]
  );

  const monthlyEmotionStats = React.useMemo(() => {
    const counts = new Map<DiaryEmotion, number>();
    const allDates = new Set([...Object.keys(moodByDate), ...Object.keys(emotionByDate)]);

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
        const moodOption = MOOD_OPTIONS.find((option) => option.type === emotionId);
        const diaryOption = DIARY_EMOTION_OPTIONS.find((option) => option.id === emotionId);

        if (!moodOption && !diaryOption) {
          return null;
        }

        return {
          id: emotionId,
          count,
          image: moodOption?.image ?? diaryOption?.image,
          label: moodOption ? t(`mood.${moodOption.type}`) : t(diaryOption!.labelKey),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [emotionByDate, moodByDate, t, visibleMonthKey]);

  const maxMonthlyEmotionCount = monthlyEmotionStats[0]?.count ?? 0;

  const monthlyBalance = React.useMemo(() => {
    const scoreByMood = new Map(MOOD_OPTIONS.map((option) => [option.type, option.score]));
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
      badPercent: total > 0 ? Math.round((bad / total) * 100) : 0,
    };
  }, [emotionByDate, moodByDate, visibleMonthKey]);

  const monthlyTrendPoints = React.useMemo(() => {
    const scoreByMood = new Map(MOOD_OPTIONS.map((option) => [option.type, option.score]));
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
        daysInSelectedMonth === 1 ? xRange / 2 : (index / (daysInSelectedMonth - 1)) * xRange;
      const normalizedScore = (MAX_MOOD_SCORE - score) / (MAX_MOOD_SCORE - MIN_MOOD_SCORE);
      const y = 12 + normalizedScore * TREND_DRAWABLE_HEIGHT;

      return {
        dateKey,
        score,
        x,
        y,
        color: getTrendPointColor(score),
      };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [daysInSelectedMonth, emotionByDate, moodByDate, trendChartWidth, visibleMonthKey]);

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
    [monthlyTrendPoints]
  );

  const stepMonth = (direction: -1 | 1) => {
    const [year, month] = visibleMonthKey.split('-').map(Number);
    const nextDate = new Date(year, month - 1 + direction, 1);
    const nextKey = toLocalMonthKey(nextDate);

    if (nextKey > currentMonthKey) {
      return;
    }

    setVisibleMonthKey(nextKey);
  };

  if (loading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar style="dark" />
          <ActivityIndicator size="large" color="#d45c8f" />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={20} color="#d45c8f" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('header.charts')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => stepMonth(-1)}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={18} color="#d45c8f" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{selectedMonthLabel}</Text>
          <TouchableOpacity
            style={[
              styles.iconButton,
              visibleMonthKey === currentMonthKey && styles.iconButtonDisabled,
            ]}
            onPress={() => stepMonth(1)}
            activeOpacity={0.85}
            disabled={visibleMonthKey === currentMonthKey}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={visibleMonthKey === currentMonthKey ? '#cda6b9' : '#d45c8f'}
            />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {monthlyEmotionStats.length === 0 &&
          monthlyBalance.total === 0 &&
          monthlyTrendPoints.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('charts.empty')}</Text>
            </View>
          ) : null}

          {monthlyEmotionStats.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
              <Text style={styles.chartTitle}>{t('logMood.monthlyEmotionTitle')}</Text>
              <Text style={styles.chartSubtitle}>{t('logMood.monthlyEmotionSubtitle')}</Text>
              <View style={styles.chartList}>
                {monthlyEmotionStats.map((item) => (
                  <View key={item.id} style={styles.chartRow}>
                    <View style={styles.chartLabelWrap}>
                      <Image source={item.image} style={styles.chartEmotionImage} resizeMode="contain" />
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
                              Math.round((item.count / maxMonthlyEmotionCount) * 100)
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
              <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
              <Text style={styles.chartTitle}>{t('logMood.balanceTitle')}</Text>
              <Text style={styles.chartSubtitle}>{t('logMood.balanceSubtitle')}</Text>
              <View style={styles.balanceSummaryRow}>
                <View style={styles.balanceSummaryItem}>
                  <Text style={[styles.balancePercent, styles.balancePercentGood]}>
                    {monthlyBalance.goodPercent}%
                  </Text>
                  <Text style={styles.balanceLabel}>{t('logMood.balanceGood')}</Text>
                </View>
                <View style={styles.balanceSummaryItem}>
                  <Text style={[styles.balancePercent, styles.balancePercentBad]}>
                    {monthlyBalance.badPercent}%
                  </Text>
                  <Text style={styles.balanceLabel}>{t('logMood.balanceBad')}</Text>
                </View>
              </View>
              <View style={styles.balanceBar}>
                <View style={[styles.balanceBarGood, { flex: monthlyBalance.good || 0 }]} />
                <View
                  style={[styles.balanceBarNeutral, { flex: monthlyBalance.neutral || 0 }]}
                />
                <View style={[styles.balanceBarBad, { flex: monthlyBalance.bad || 0 }]} />
              </View>
              <View style={styles.balanceLegend}>
                <View style={styles.balanceLegendItem}>
                  <View style={[styles.balanceLegendDot, styles.balanceLegendDotGood]} />
                  <Text style={styles.balanceLegendText}>
                    {t('logMood.balanceGood')} {monthlyBalance.good}
                  </Text>
                </View>
                <View style={styles.balanceLegendItem}>
                  <View style={[styles.balanceLegendDot, styles.balanceLegendDotNeutral]} />
                  <Text style={styles.balanceLegendText}>
                    {t('logMood.balanceNeutral')} {monthlyBalance.neutral}
                  </Text>
                </View>
                <View style={styles.balanceLegendItem}>
                  <View style={[styles.balanceLegendDot, styles.balanceLegendDotBad]} />
                  <Text style={styles.balanceLegendText}>
                    {t('logMood.balanceBad')} {monthlyBalance.bad}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {monthlyTrendPoints.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartEyebrow}>{selectedMonthLabel}</Text>
              <Text style={styles.chartTitle}>{t('logMood.moodFlowTitle')}</Text>
              <Text style={styles.chartSubtitle}>{t('logMood.moodFlowSubtitle')}</Text>
              <View style={styles.trendCardInner}>
                <View style={styles.trendAxisLabels}>
                  <Text style={styles.trendAxisLabel}>{t('logMood.moodFlowHigh')}</Text>
                  <Text style={styles.trendAxisLabel}>{t('logMood.moodFlowLow')}</Text>
                </View>
                <View
                  style={styles.trendChart}
                  onLayout={(event) => setTrendChartWidth(event.nativeEvent.layout.width)}
                >
                  <View style={[styles.trendGuideLine, styles.trendGuideLineTop]} />
                  <View style={[styles.trendGuideLine, styles.trendGuideLineMiddle]} />
                  <View style={[styles.trendGuideLine, styles.trendGuideLineBottom]} />
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
                  <Text style={styles.trendDayLabel}>{Math.ceil(daysInSelectedMonth / 2)}</Text>
                  <Text style={styles.trendDayLabel}>{daysInSelectedMonth}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 231, 238, 0.96)',
  },
  iconButtonDisabled: {
    backgroundColor: 'rgba(248, 231, 238, 0.56)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5f4453',
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5f4453',
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 248, 251, 0.84)',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#7d6470',
    textAlign: 'center',
  },
  chartCard: {
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
