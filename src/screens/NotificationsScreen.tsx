import React, { useState, useEffect } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
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
import { Ionicons } from '@expo/vector-icons';
import { TimePicker } from '../components/TimePicker';
import { IntervalSelector } from '../components/IntervalSelector';
import { LanguageSwitchButton } from '../components/LanguageSwitchButton';
import { NotificationSettings } from '../types';
import { saveSettings, loadSettings } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';
import {
    requestPermissions,
    scheduleNotifications,
    cancelAllNotifications,
    getScheduledNotificationsCount,
    sendTestNotification
} from '../services/notificationService';

export const NotificationsScreen = () => {
    const { t } = useLanguage();
    const headerHeight = useHeaderHeight();
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
            Alert.alert(t('alerts.invalidRangeTitle'), t('alerts.invalidRangeMessage'));
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
                    t('alerts.permissionTitle'),
                    t('alerts.permissionMessage')
                );
                setLoading(false);
                return;
            }

            await scheduleNotifications(settings, {
                title: t('notifications.reminderTitle'),
                body: t('notifications.reminderBody'),
            });

            const newSettings = { ...settings, isActive: true };
            setSettings(newSettings);
            await saveSettings(newSettings);

            await updateScheduledCount();

            Alert.alert(
                t('alerts.successTitle'),
                t('alerts.scheduledSuccess')
            );
        } catch (error) {
            console.error('Error starting notifications:', error);
            Alert.alert(t('alerts.errorTitle'), t('alerts.scheduleFailed'));
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

            Alert.alert(t('alerts.successTitle'), t('alerts.cancelledSuccess'));
        } catch (error) {
            console.error('Error stopping notifications:', error);
            Alert.alert(t('alerts.errorTitle'), t('alerts.cancelFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                Alert.alert(
                    t('alerts.permissionTitle'),
                    t('alerts.permissionMessage')
                );
                return;
            }
            await sendTestNotification({
                title: t('notifications.testTitle'),
                body: t('notifications.testBody'),
            });
            Alert.alert(t('alerts.sentTitle'), t('alerts.sentMessage'));
        } catch (error) {
            console.error('Error sending test notification:', error);
            Alert.alert(t('alerts.errorTitle'), t('alerts.testFailed'));
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
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight + 10 }]}
            >
                <View style={styles.header}>
                    <View style={styles.languageSwitchRow}>
                        <LanguageSwitchButton />
                    </View>
                    <View style={styles.titleContainer}>
                        <Ionicons name="notifications-circle" size={40} color="#007AFF" style={styles.headerIcon} />
                        <Text style={styles.title}>{t('notifications.title')}</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        {t('notifications.subtitle')}
                    </Text>
                </View>

                <View style={styles.card}>
                    <TimePicker
                        label={t('notifications.startTime')}
                        value={settings.startTime}
                        onChange={handleStartTimeChange}
                    />

                    <TimePicker
                        label={t('notifications.endTime')}
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
                                <Ionicons name="checkmark-circle" size={20} color="#2e7d32" style={styles.statusIcon} />
                                <Text style={styles.statusText}>
                                    {t('notifications.activeStatus', { count: scheduledCount })}
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
                                    <View style={styles.buttonInner}>
                                        <Ionicons name="play" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>{t('notifications.startButton')}</Text>
                                    </View>
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
                                    <View style={styles.buttonInner}>
                                        <Ionicons name="stop" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>{t('notifications.stopButton')}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.testButton]}
                            onPress={handleTest}
                            disabled={loading}
                        >
                            <View style={styles.buttonInner}>
                                <Ionicons name="flash" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>{t('notifications.testButton')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoTitleContainer}>
                        <Ionicons name="information-circle" size={24} color="#007AFF" style={styles.infoIcon} />
                        <Text style={styles.infoTitle}>{t('notifications.howItWorks')}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={18} color="#666" style={styles.infoItemIcon} />
                        <Text style={styles.infoText}>
                            {t('notifications.infoInterval')}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="volume-medium-outline" size={18} color="#666" style={styles.infoItemIcon} />
                        <Text style={styles.infoText}>
                            {t('notifications.infoSound')}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="save-outline" size={18} color="#666" style={styles.infoItemIcon} />
                        <Text style={styles.infoText}>
                            {t('notifications.infoSaved')}
                        </Text>
                    </View>
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
        padding: 10,
    },
    header: {
        marginBottom: 24,
    },
    languageSwitchRow: {
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerIcon: {
        marginRight: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
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
    statusIcon: {
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
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    startButton: {
        backgroundColor: '#007AFF',
    },
    stopButton: {
        backgroundColor: '#ff3b30',
    },
    testButton: {
        backgroundColor: '#5856D6',
        marginTop: 12,
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
        marginBottom: 20,
    },
    infoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoItemIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
});
