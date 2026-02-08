import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadStats();
    }, [timeRange, refreshTrigger]);

    const loadStats = async () => {
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
    };

    const renderMoodBar = (mood: string, count: number, total: number) => {
        const moodOption = MOOD_OPTIONS.find((m) => m.type === mood);
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const barWidth = (percentage / 100) * (width - 120);

        return (
            <View key={mood} style={styles.barContainer}>
                <View style={styles.barLabel}>
                    <Text style={styles.barEmoji}>{moodOption?.emoji}</Text>
                    <Text style={styles.barText}>{moodOption?.label}</Text>
                </View>
                <View style={styles.barWrapper}>
                    <View
                        style={[
                            styles.bar,
                            {
                                width: Math.max(barWidth, 0),
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
        if (score >= 4.5) return 'Excellent';
        if (score >= 3.5) return 'Good';
        if (score >= 2.5) return 'Fair';
        if (score >= 1.5) return 'Poor';
        return 'Very Poor';
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
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Time Range Selector */}
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
                    <Text style={styles.emptyEmoji}>📊</Text>
                    <Text style={styles.emptyTitle}>No data yet</Text>
                    <Text style={styles.emptyText}>
                        Start logging your mood to see analytics
                    </Text>
                </View>
            ) : (
                <>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardTitle}>Summary - {getTimeRangeLabel()}</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{stats.totalEntries}</Text>
                                <Text style={styles.summaryLabel}>Total Entries</Text>
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

                    {/* Mood Distribution */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Mood Distribution</Text>
                        <View style={styles.barsContainer}>
                            {Object.entries(stats.moodFrequency).map(([mood, count]) =>
                                renderMoodBar(mood, count, stats.totalEntries)
                            )}
                        </View>
                    </View>

                    {/* Top Activities */}
                    {stats.topActivities.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Top Activities</Text>
                            <View style={styles.activitiesList}>
                                {stats.topActivities.map((item, index) => (
                                    <View key={index} style={styles.activityItem}>
                                        <View style={styles.activityRank}>
                                            <Text style={styles.rankText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.activityName}>{item.activity}</Text>
                                        <View style={styles.activityCount}>
                                            <Text style={styles.countText}>{item.count}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Insights */}
                    <View style={styles.insightsCard}>
                        <Text style={styles.cardTitle}>💡 Insights</Text>
                        {stats.averageMoodScore >= 4 && (
                            <Text style={styles.insightText}>
                                ✨ You're doing great! Your mood has been consistently positive.
                            </Text>
                        )}
                        {stats.averageMoodScore < 3 && (
                            <Text style={styles.insightText}>
                                🌱 Consider activities that boost your mood. Take care of yourself!
                            </Text>
                        )}
                        {stats.topActivities.length > 0 && (
                            <Text style={styles.insightText}>
                                🎯 You spend most time on: {stats.topActivities[0].activity}
                            </Text>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    timeRangeButtonActive: {
        backgroundColor: '#007AFF',
    },
    timeRangeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    timeRangeTextActive: {
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 20,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    barsContainer: {
        gap: 12,
    },
    barContainer: {
        gap: 8,
    },
    barLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barEmoji: {
        fontSize: 20,
    },
    barText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bar: {
        height: 24,
        borderRadius: 12,
        minWidth: 2,
    },
    barCount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        minWidth: 30,
    },
    activitiesList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    activityRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    activityName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    activityCount: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    countText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
    },
    insightsCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#FFE082',
    },
    insightText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 8,
    },
});
