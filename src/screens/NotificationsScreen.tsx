import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TimePicker } from '../components/TimePicker';
import { IntervalSelector } from '../components/IntervalSelector';
import { NotificationSettings } from '../types';
import { saveSettings, loadSettings } from '../utils/storage';
import {
    requestPermissions,
    scheduleNotifications,
    cancelAllNotifications,
    getScheduledNotificationsCount,
} from '../services/notificationService';

export const NotificationsScreen = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        startTime: '08:00',
        endTime: '20:00',
        interval: 60,
        isActive: false,
    });
    const [loading, setLoading] = useState(true);
    const [scheduledCount, setScheduledCount] = useState(0);

    useEffect(() => {
        loadInitialSettings();
    }, []);

    useEffect(() => {
        updateScheduledCount();
    }, [settings.isActive]);

    const loadInitialSettings = async () => {
        try {
            const savedSettings = await loadSettings();
            setSettings(savedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateScheduledCount = async () => {
        const count = await getScheduledNotificationsCount();
        setScheduledCount(count);
    };

    const handleStartTimeChange = (time: string) => {
        setSettings({ ...settings, startTime: time });
    };

    const handleEndTimeChange = (time: string) => {
        setSettings({ ...settings, endTime: time });
    };

    const handleIntervalChange = (interval: 30 | 60) => {
        setSettings({ ...settings, interval });
    };

    const validateTimeRange = (): boolean => {
        const [startHour, startMin] = settings.startTime.split(':').map(Number);
        const [endHour, endMin] = settings.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            Alert.alert('Invalid Time Range', 'End time must be after start time.');
            return false;
        }

        return true;
    };

    const handleStart = async () => {
        if (!validateTimeRange()) {
            return;
        }

        try {
            setLoading(true);

            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings.'
                );
                setLoading(false);
                return;
            }

            await scheduleNotifications(settings);

            const newSettings = { ...settings, isActive: true };
            setSettings(newSettings);
            await saveSettings(newSettings);

            await updateScheduledCount();

            Alert.alert(
                'Success',
                'Notifications have been scheduled successfully!'
            );
        } catch (error) {
            console.error('Error starting notifications:', error);
            Alert.alert('Error', 'Failed to schedule notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        try {
            setLoading(true);

            await cancelAllNotifications();

            const newSettings = { ...settings, isActive: false };
            setSettings(newSettings);
            await saveSettings(newSettings);

            setScheduledCount(0);

            Alert.alert('Success', 'All notifications have been cancelled.');
        } catch (error) {
            console.error('Error stopping notifications:', error);
            Alert.alert('Error', 'Failed to cancel notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && scheduledCount === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>⏰ Notification Scheduler</Text>
                    <Text style={styles.subtitle}>
                        Schedule recurring notifications within your preferred time range
                    </Text>
                </View>

                <View style={styles.card}>
                    <TimePicker
                        label="Start Time"
                        value={settings.startTime}
                        onChange={handleStartTimeChange}
                    />

                    <TimePicker
                        label="End Time"
                        value={settings.endTime}
                        onChange={handleEndTimeChange}
                    />

                    <IntervalSelector
                        value={settings.interval}
                        onChange={handleIntervalChange}
                    />

                    {settings.isActive && (
                        <View style={styles.statusContainer}>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>
                                    Active • {scheduledCount} notifications scheduled
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        {!settings.isActive ? (
                            <TouchableOpacity
                                style={[styles.button, styles.startButton]}
                                onPress={handleStart}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Start Notifications</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.stopButton]}
                                onPress={handleStop}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Stop Notifications</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ℹ️ How it works</Text>
                    <Text style={styles.infoText}>
                        • Notifications will be sent at regular intervals within your time range
                    </Text>
                    <Text style={styles.infoText}>
                        • Notifications include sound and will appear even when the app is closed
                    </Text>
                    <Text style={styles.infoText}>
                        • Your settings are saved automatically
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    statusContainer: {
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4caf50',
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
    },
    buttonContainer: {
        marginTop: 8,
    },
    button: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    startButton: {
        backgroundColor: '#007AFF',
    },
    stopButton: {
        backgroundColor: '#ff3b30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 8,
    },
});
