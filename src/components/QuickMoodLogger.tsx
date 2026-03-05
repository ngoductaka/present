import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MoodType, MOOD_OPTIONS, MoodEntry, ACTIVITY_OPTIONS } from '../types';
import { saveMoodEntry } from '../services/moodService';

interface QuickMoodLoggerProps {
    onSaved?: () => void;
    onMoodChange?: (mood: typeof MOOD_OPTIONS[0] | null) => void;
}

export const QuickMoodLogger: React.FC<QuickMoodLoggerProps> = ({ onSaved, onMoodChange }) => {
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    const handleMoodSelect = (mood: MoodType) => {
        setSelectedMood(mood);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
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
        setSelectedActivities(prev =>
            prev.includes(activityId)
                ? prev.filter(id => id !== activityId)
                : [...prev, activityId]
        );
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
            setSelectedMood(null);
            setSelectedActivities([]);
            setNote('');
            onMoodChange?.(null);
            Alert.alert('Saved!', 'Your moment has been captured ✨');
            onSaved?.();
        } catch (error) {
            Alert.alert('Error', 'Failed to save entry');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>How are you feeling?</Text>
                    <View style={styles.moodGrid}>
                        {MOOD_OPTIONS.map((mood) => {
                            const isSelected = selectedMood === mood.type;
                            return (
                                <TouchableOpacity
                                    key={mood.type}
                                    style={[
                                        styles.moodButton,
                                        isSelected && styles.moodButtonSelected,
                                        { backgroundColor: mood.bgColor, borderColor: isSelected ? mood.color : '#fff' },
                                    ]}
                                    onPress={() => {
                                        handleMoodSelect(mood.type);
                                        onMoodChange?.(mood);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Animated.View style={{
                                        transform: [{ scale: isSelected ? scaleAnim : 1 }],
                                    }}>
                                        {mood.iconFamily === 'Ionicons' ? (
                                            <Ionicons name={mood.icon as any} size={28} color={mood.color} />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name={mood.icon as any} size={28}
                                                color={mood.color} />
                                        )}
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>What are you doing?</Text>
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
                                    <Text style={styles.activityLabel}>{activity.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Add a note (optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Reflections, thoughts..."
                        placeholderTextColor="#ccc"
                        value={note}
                        onChangeText={setNote}
                        multiline={false}
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        opacity: 0.9,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginBottom: 20,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 20,
    },
    moodButton: {
        width: '22%',
        borderWidth: 2,
        borderColor: '#fff',
        // aspectRatio: 1,
        paddingVertical: 20,
        borderRadius: 100,
        // display: 'flex',
        // flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodButtonSelected: {
        borderWidth: 2,
        borderColor: '#eeaeaeff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputSection: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginBottom: 12,
        marginLeft: 4,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    saveButton: {
        backgroundColor: '#8ac4c2', // Teal color from design
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8ac4c2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 4,
    },
    activityButtonSelected: {
        backgroundColor: '#e1f5f4',
        borderColor: '#8ac4c2',
    },
    activityEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    activityLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
});
