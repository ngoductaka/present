import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings, DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = '@notification_settings';

export const saveSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<NotificationSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as
        | NotificationSettings
        | {
            startTime?: string;
            time?: string;
            isActive?: boolean;
          };
      const legacyStartTime =
        'startTime' in parsed ? parsed.startTime : undefined;

      return {
        time: parsed.time ?? legacyStartTime ?? DEFAULT_SETTINGS.time,
        isActive: parsed.isActive ?? DEFAULT_SETTINGS.isActive,
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};
