import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSWORD_STORAGE_KEY = '@app_password';

export const savePassword = async (password: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PASSWORD_STORAGE_KEY, password);
  } catch (error) {
    console.error('Error saving password:', error);
    throw error;
  }
};

export const hasPassword = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
    return Boolean(value);
  } catch (error) {
    console.error('Error loading password status:', error);
    return false;
  }
};
