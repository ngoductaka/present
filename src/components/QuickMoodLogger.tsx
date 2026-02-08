import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { MoodType, MOOD_OPTIONS, ACTIVITY_OPTIONS, MoodEntry } from '../types';
import { saveMoodEntry } from '../services/moodService';

interface QuickMoodLoggerProps {
    onSaved?: () => void;
}

export const QuickMoodLogger: React.FC<QuickMoodLoggerProps> = ({ onSaved }) => {
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    const handleMoodSelect = (mood: MoodType) => {
        setSelectedMood(mood);
        // Animate selection
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const toggleActivity = (activityId: string) => {
        if (selectedActivities.includes(activityId)) {
            setSelectedActivities(selectedActivities.filter((id) => id !== activityId));
        } else {
            setSelectedActivities([...selectedActivities, activityId]);
        }
    };

    const handleSave = async () => {
        if (!selectedMood) {
            Alert.alert('Select Mood', 'Please select how you\'re feeling');
            return;
        }

        try {
            setSaving(true);

            const entry: MoodEntry = {
                id: Date.now().toString(),
                mood: selectedMood,
                activities: selectedActivities,
                note: note.trim() || undefined,
                timestamp: Date.now(),
            };

            await saveMoodEntry(entry);

            // Reset form
            setSelectedMood(null);
            setSelectedActivities([]);
            setNote('');

            Alert.alert('Saved!', 'Your mood has been logged 🎉');
            onSaved?.();
        } catch (error) {
            Alert.alert('Error', 'Failed to save mood entry');
        } finally {
            setSaving(false);
        }
    };

    const selectedMoodOption = MOOD_OPTIONS.find((m) => m.type === selectedMood);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
                <View style={styles.moodGrid}>
                    {MOOD_OPTIONS.map((mood) => {
                        const isSelected = selectedMood === mood.type;
                        return (
                            <TouchableOpacity
                                key={mood.type}
                                style={[
                                    styles.moodButton,
                                    isSelected && {
                                        backgroundColor: mood.color,
                                        transform: [{ scale: 1.05 }],
                                    },
                                ]}
                                onPress={() => handleMoodSelect(mood.type)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                <Text
                                    style={[
                                        styles.moodLabel,
                                        isSelected && styles.moodLabelSelected,
                                    ]}
                                >
                                    {mood.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {selectedMood && (
                <Animated.View style={[styles.section, { opacity: scaleAnim }]}>
                    <Text style={styles.sectionTitle}>What are you doing?</Text>
                    <View style={styles.activityGrid}>
                        {ACTIVITY_OPTIONS.map((activity) => {
                            const isSelected = selectedActivities.includes(activity.id);
                            return (
                                <TouchableOpacity
                                    key={activity.id}
                                    style={[
                                        styles.activityButton,
                                        isSelected && styles.activityButtonSelected,
                                    ]}
                                    onPress={() => toggleActivity(activity.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.activityLabel,
                                            isSelected && styles.activityLabelSelected,
                                        ]}
                                    >
                                        {activity.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.noteSection}>
                        <Text style={styles.noteLabel}>Add a note (optional)</Text>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="What's on your mind?"
                            placeholderTextColor="#999"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            maxLength={200}
                        />
                        <Text style={styles.charCount}>{note.length}/200</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: selectedMoodOption?.color || '#007AFF' },
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>
                            {saving ? 'Saving...' : '✓ Save Mood'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        // backgroundColor: 'blue',
    },
    section: {
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    moodButton: {
        width: '18%',
        aspectRatio: 1,
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    moodLabelSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    activityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activityButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#0056b3',
    },
    activityEmoji: {
        fontSize: 18,
        marginRight: 6,
    },
    activityLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    activityLabelSelected: {
        color: '#fff',
    },
    noteSection: {
        marginTop: 20,
    },
    noteLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    noteInput: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#333',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
