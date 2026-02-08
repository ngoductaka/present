// Configuration file for customizing the notification scheduler app

export const APP_CONFIG = {
  // Notification content
  notification: {
    title: '⏰ Reminder',
    body: 'Time for your scheduled notification!',
    // You can customize the sound here
    // For custom sounds, add sound files to assets folder
    sound: 'default', // or 'custom_sound.wav'
  },

  // Default time settings
  defaults: {
    startTime: '08:00',
    endTime: '20:00',
    interval: 60, // 30 or 60 minutes
  },

  // Available interval options (in minutes)
  intervalOptions: [30, 60],

  // UI customization
  theme: {
    primaryColor: '#007AFF',
    dangerColor: '#ff3b30',
    successColor: '#4caf50',
    backgroundColor: '#f5f5f5',
    cardBackground: '#ffffff',
  },

  // Android notification channel settings
  android: {
    channelId: 'default',
    channelName: 'Default',
    importance: 'MAX', // 'MAX', 'HIGH', 'DEFAULT', 'LOW', 'MIN'
    vibrationPattern: [0, 250, 250, 250], // milliseconds
    lightColor: '#FF231F7C',
  },

  // iOS notification settings
  ios: {
    // iOS-specific settings can be added here
    criticalAlert: false, // Requires special entitlement
  },

  // Feature flags
  features: {
    allowCustomIntervals: false, // Future feature: custom interval input
    allowMultipleTimeRanges: false, // Future feature: multiple time ranges
    showNotificationHistory: false, // Future feature: notification history
  },
};

// Helper function to get formatted notification content
export const getNotificationContent = () => ({
  title: APP_CONFIG.notification.title,
  body: APP_CONFIG.notification.body,
  sound: APP_CONFIG.notification.sound,
});

// Helper function to validate interval
export const isValidInterval = (interval: number): boolean => {
  return APP_CONFIG.intervalOptions.includes(interval);
};
