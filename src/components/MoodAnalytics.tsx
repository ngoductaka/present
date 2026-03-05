import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { MoodStats, MOOD_OPTIONS } from '../types';
import { calculateMoodStats } from '../services/moodService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type TimeRange = 'day' | 'week' | 'month';

interface MoodAnalyticsProps {
    refreshTrigger?: number;
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({
    refreshTrigger,
}) => {
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
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const availableWidth = width - 180;
        const barWidth = total > 0 ? (count / total) * availableWidth : 0;

        return (
            <View key={mood} style={styles.barContainer}>
                <View style={styles.barLabel}>
                    <View style={[styles.barIconWrapper, { backgroundColor: moodOption?.bgColor || '#f0f0f0' }]}>
                        {moodOption?.iconFamily === 'Ionicons' ? (
                            <Ionicons name={moodOption.icon as any} size={16} color={moodOption.color} />
                        ) : (
                            <MaterialCommunityIcons name={moodOption?.icon as any} size={16} color={moodOption?.color} />
                        )}
                    </View>
                    <Text style={styles.barText} numberOfLines={1}>{moodOption?.label}</Text>
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
        if (score >= 4.5) return 'Radiant';
        if (score >= 3.5) return 'Balanced';
        if (score >= 2.5) return 'Steady';
        if (score >= 1.5) return 'Unsettled';
        return 'Low Energy';
    };

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case 'day':
                return 'Today';
            case 'week':
                return 'Last 7 Days';
            case 'month':
                return 'Last 30 Days';
        }
    };

    if (!stats) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Analyzing your journey...</Text>
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
                            {range === 'day' ? 'Today' : range === 'week' ? 'Week' : 'Month'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {stats.totalEntries === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={80} color="#eee" style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>Insights pending</Text>
                    <Text style={styles.emptyText}>
                        Continue your practice to reveal patterns.
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardTitle}>Journey Summary</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{stats.totalEntries}</Text>
                                <Text style={styles.summaryLabel}>Moments</Text>
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
                        <Text style={styles.cardTitle}>Feeling Distribution</Text>
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
                            <Text style={styles.insightTitle}>Reflections</Text>
                        </View>
                        {stats.averageMoodScore >= 4 && (
                            <Text style={styles.insightText}>
                                Your practice is flourishing. You've maintained a presence of gratitude and energy.
                            </Text>
                        )}
                        {stats.averageMoodScore < 3 && (
                            <Text style={styles.insightText}>
                                This period has been challenging. Remember to breathe and return to the present moment.
                            </Text>
                        )}
                        <Text style={styles.insightText}>
                            Consistent logging helps you understand the ebb and flow of your awakening.
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
        padding: 24,
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
        padding: 24,
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
        gap: 16,
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

