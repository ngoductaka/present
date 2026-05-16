import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

interface NotificationContentInput {
  title: string;
  body: string;
}

// Configure notification behavior
// This handler controls how notifications appear when the app is in the FOREGROUND
// When app is in background or killed, notifications are automatically shown by the OS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show alert when app is in foreground
    shouldPlaySound: true,       // Play sound in all states
    shouldSetBadge: false,       // Don't update badge count
    shouldShowBanner: true,      // Show banner notification
    shouldShowList: true,        // Add to notification list
  }),
});

/**
 * Request notification permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

/**
 * Parse time string (HH:mm) to hours and minutes
 */
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Schedule all notifications based on settings
 */
export const scheduleNotifications = async (
  settings: NotificationSettings,
  content: NotificationContentInput
): Promise<void> => {
  try {
    // Cancel all existing notifications first
    await cancelAllNotifications();

    const { hours, minutes } = parseTime(settings.time);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    console.log('Scheduled daily notification');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    throw error;
  }
};

/**
 * Get count of scheduled notifications
 */
export const getScheduledNotificationsCount = async (): Promise<number> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.length;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return 0;
  }
};

/**
 * Send a test notification immediately
 */
export const sendTestNotification = async (
  content: NotificationContentInput
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    console.log('Test notification sent');
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};
