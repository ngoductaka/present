import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface MoodHistoryProps {
    refreshTrigger?: number;
}

export const MoodHistory: React.FC<MoodHistoryProps> = ({ refreshTrigger }) => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [groupedEntries, setGroupedEntries] = useState<
        Record<string, MoodEntry[]>
    >({});

    const loadEntries = useCallback(async () => {
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
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [loadEntries])
    );

    useEffect(() => {
        loadEntries();
    }, [refreshTrigger, loadEntries]);

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
                <Ionicons name="document-text-outline" size={80} color="#ccc" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No entries yet</Text>
                <Text style={styles.emptyText}>
                    Log your first moment to see it here
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
                                style={styles.entryCard}
                            >
                                <View style={styles.entryHeader}>
                                    <View style={styles.moodContainer}>
                                        <View style={[styles.iconWrapper, { backgroundColor: moodOption?.bgColor || '#f0f0f0' }]}>
                                            {moodOption?.iconFamily === 'Ionicons' ? (
                                                <Ionicons name={moodOption.icon as any} size={24} color={moodOption.color} />
                                            ) : (
                                                <MaterialCommunityIcons name={moodOption?.icon as any} size={24} color={moodOption?.color} />
                                            )}
                                        </View>
                                        <View style={styles.entryTextContent}>
                                            <Text style={styles.moodLabel}>{moodOption?.label}</Text>
                                            <Text style={styles.timeText}>{formatTime(entry.timestamp)}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(entry)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                </View>

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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    dateSection: {
        marginBottom: 20,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        marginBottom: 12,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    moodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    entryTextContent: {
        justifyContent: 'center',
    },
    moodLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    timeText: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    deleteButton: {
        padding: 6,
    },
    noteContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f9f9f9',
    },
    noteText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
});

