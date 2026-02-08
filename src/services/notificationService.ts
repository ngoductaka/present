import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
      alert('Permission to send notifications was denied!');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
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
 * Calculate all notification times based on settings
 */
const calculateNotificationTimes = (settings: NotificationSettings): Date[] => {
  const { startTime, endTime, interval } = settings;
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const times: Date[] = [];
  const now = new Date();
  
  // Start from the start time
  let currentMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  while (currentMinutes <= endMinutes) {
    const notificationTime = new Date(now);
    notificationTime.setHours(Math.floor(currentMinutes / 60));
    notificationTime.setMinutes(currentMinutes % 60);
    notificationTime.setSeconds(0);
    notificationTime.setMilliseconds(0);

    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    times.push(notificationTime);
    currentMinutes += interval;
  }

  return times;
};

/**
 * Schedule all notifications based on settings
 */
export const scheduleNotifications = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    // Cancel all existing notifications first
    await cancelAllNotifications();

    const times = calculateNotificationTimes(settings);

    for (const time of times) {
      // Create a daily repeating trigger
      const hour = time.getHours();
      const minute = time.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Reminder',
          body: 'Time for your scheduled notification!',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        },
      });
    }

    console.log(`Scheduled ${times.length} notifications`);
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
