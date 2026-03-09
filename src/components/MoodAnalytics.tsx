import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { MoodStats, MOOD_OPTIONS } from '../types';
import { calculateMoodStats } from '../services/moodService';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

type TimeRange = 'day' | 'week' | 'month';

interface MoodAnalyticsProps {
    refreshTrigger?: number;
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({
    refreshTrigger,
}) => {
    const { t } = useLanguage();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [stats, setStats] = useState<MoodStats | null>(null);

    const loadStats = useCallback(async () => {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeRange) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(startDate.getDate() - 30);
                break;
        }

        const moodStats = await calculateMoodStats(startDate, endDate);
        setStats(moodStats);
    }, [timeRange]);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [loadStats])
    );

    useEffect(() => {
        loadStats();
    }, [loadStats, refreshTrigger]);

    const renderMoodBar = (mood: string, count: number, total: number) => {
        const moodOption = MOOD_OPTIONS.find((m) => m.type === mood);
        const availableWidth = width - 205;
        const barWidth = total > 0 ? (count / total) * availableWidth : 0;

        return (
            <View key={mood} style={styles.barContainer}>
                <View style={styles.barLabel}>
                    <View style={[styles.barIconWrapper, { backgroundColor: moodOption?.bgColor || '#f0f0f0' }]}>
                        {moodOption && (
                            <Image
                                source={moodOption.image}
                                style={{ width: 16, height: 16 }}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                    <Text style={styles.barText} numberOfLines={1}>
                        {moodOption ? t(`mood.${moodOption.type}`) : mood}
                    </Text>
                </View>
                <View style={styles.barWrapper}>
                    <View
                        style={[
                            styles.bar,
                            {
                                width: Math.max(barWidth, 4),
                                backgroundColor: moodOption?.color || '#ccc',
                            },
                        ]}
                    />
                    <Text style={styles.barCount}>{count}</Text>
                </View>
            </View>
        );
    };

    const getMoodScoreLabel = (score: number) => {
        if (score >= 4.5) return t('analytics.radiant');
        if (score >= 3.5) return t('analytics.balanced');
        if (score >= 2.5) return t('analytics.steady');
        if (score >= 1.5) return t('analytics.unsettled');
        return t('analytics.lowEnergy');
    };

    if (!stats) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t('analytics.loading')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.timeRangeContainer}>
                {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.timeRangeButton,
                            timeRange === range && styles.timeRangeButtonActive,
                        ]}
                        onPress={() => setTimeRange(range)}
                    >
                        <Text
                            style={[
                                styles.timeRangeText,
                                timeRange === range && styles.timeRangeTextActive,
                            ]}
                        >
                            {range === 'day' ? t('analytics.today') : range === 'week' ? t('analytics.week') : t('analytics.month')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {stats.totalEntries === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={80} color="#eee" style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>{t('analytics.emptyTitle')}</Text>
                    <Text style={styles.emptyText}>
                        {t('analytics.emptyText')}
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardTitle}>{t('analytics.summaryTitle')}</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{stats.totalEntries}</Text>
                                <Text style={styles.summaryLabel}>{t('analytics.moments')}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {stats.averageMoodScore.toFixed(1)}
                                </Text>
                                <Text style={styles.summaryLabel}>
                                    {getMoodScoreLabel(stats.averageMoodScore)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('analytics.distributionTitle')}</Text>
                        <View style={styles.barsContainer}>
                            {Object.entries(stats.moodFrequency)
                                .sort(([, a], [, b]) => b - a)
                                .map(([mood, count]) =>
                                    renderMoodBar(mood, count, stats.totalEntries)
                                )}
                        </View>
                    </View>

                    <View style={styles.insightsCard}>
                        <View style={styles.insightTitleContainer}>
                            <Ionicons name="sparkles-outline" size={20} color="#b8a17d" style={styles.insightIcon} />
                            <Text style={styles.insightTitle}>{t('analytics.reflectionsTitle')}</Text>
                        </View>
                        {stats.averageMoodScore >= 4 && (
                            <Text style={styles.insightText}>
                                {t('analytics.reflectionHigh')}
                            </Text>
                        )}
                        {stats.averageMoodScore < 3 && (
                            <Text style={styles.insightText}>
                                {t('analytics.reflectionLow')}
                            </Text>
                        )}
                        <Text style={styles.insightText}>
                            {t('analytics.reflectionGeneral')}
                        </Text>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    loadingText: {
        fontSize: 16,
        color: '#999',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 25,
        padding: 4,
        marginBottom: 20,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
    },
    timeRangeButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeRangeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
    },
    timeRangeTextActive: {
        color: '#333',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#8ac4c2',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    barsContainer: {
        gap: 10,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    barLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100,
    },
    barIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    barText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        flex: 1,
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    bar: {
        height: 10,
        borderRadius: 5,
        marginRight: 10,
        marginLeft: 10,
    },
    barCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#444',
        width: 25,
        textAlign: 'right',
    },
    insightsCard: {
        backgroundColor: '#fefaf2',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#f2e8cf',
    },
    insightTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#b8a17d',
    },
    insightIcon: {
        marginRight: 8,
    },
    insightText: {
        fontSize: 14,
        color: '#8c7e6a',
        lineHeight: 20,
        marginBottom: 10,
    },
});
