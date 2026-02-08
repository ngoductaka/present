import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { MoodEntry, MOOD_OPTIONS, ACTIVITY_OPTIONS } from '../types';
import { getAllMoodEntries, deleteMoodEntry } from '../services/moodService';

interface MoodHistoryProps {
    refreshTrigger?: number;
}

export const MoodHistory: React.FC<MoodHistoryProps> = ({ refreshTrigger }) => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [groupedEntries, setGroupedEntries] = useState<
        Record<string, MoodEntry[]>
    >({});

    useEffect(() => {
        loadEntries();
    }, [refreshTrigger]);

    const loadEntries = async () => {
        const allEntries = await getAllMoodEntries();
        setEntries(allEntries);

        // Group by date
        const grouped: Record<string, MoodEntry[]> = {};
        allEntries.forEach((entry) => {
            const date = new Date(entry.timestamp);
            const dateKey = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(entry);
        });

        setGroupedEntries(grouped);
    };

    const handleDelete = (entry: MoodEntry) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this mood entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteMoodEntry(entry.id);
                        loadEntries();
                    },
                },
            ]
        );
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getMoodOption = (mood: string) => {
        return MOOD_OPTIONS.find((m) => m.type === mood);
    };

    const getActivityLabel = (activityId: string) => {
        const activity = ACTIVITY_OPTIONS.find((a) => a.id === activityId);
        return activity ? `${activity.emoji} ${activity.label}` : activityId;
    };

    if (entries.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyTitle}>No mood entries yet</Text>
                <Text style={styles.emptyText}>
                    Start tracking your mood to see your history here
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
                <View key={date} style={styles.dateSection}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {dateEntries.map((entry) => {
                        const moodOption = getMoodOption(entry.mood);
                        return (
                            <View
                                key={entry.id}
                                style={[
                                    styles.entryCard,
                                    { borderLeftColor: moodOption?.color || '#ccc' },
                                ]}
                            >
                                <View style={styles.entryHeader}>
                                    <View style={styles.moodInfo}>
                                        <Text style={styles.moodEmoji}>{moodOption?.emoji}</Text>
                                        <View>
                                            <Text style={styles.moodLabel}>{moodOption?.label}</Text>
                                            <Text style={styles.timeText}>{formatTime(entry.timestamp)}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(entry)}
                                        style={styles.deleteButton}
                                    >
                                        <Text style={styles.deleteText}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>

                                {entry.activities.length > 0 && (
                                    <View style={styles.activitiesContainer}>
                                        {entry.activities.map((activityId, index) => (
                                            <View key={index} style={styles.activityTag}>
                                                <Text style={styles.activityText}>
                                                    {getActivityLabel(activityId)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {entry.note && (
                                    <View style={styles.noteContainer}>
                                        <Text style={styles.noteText}>{entry.note}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f5f5f5',
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
        lineHeight: 22,
    },
    dateSection: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    moodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moodEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    moodLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    timeText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    deleteButton: {
        padding: 4,
    },
    deleteText: {
        fontSize: 20,
    },
    activitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    activityTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    activityText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    noteContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    noteText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        fontStyle: 'italic',
    },
});
