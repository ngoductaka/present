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

export const removePassword = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing password:', error);
    throw error;
  }
};

export const getPassword = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PASSWORD_STORAGE_KEY);
  } catch (error) {
    console.error('Error loading password:', error);
    return null;
  }
};

export const hasPassword = async (): Promise<boolean> => {
  try {
    const value = await getPassword();
    return Boolean(value);
  } catch (error) {
    console.error('Error loading password status:', error);
    return false;
  }
};

export const verifyPassword = async (input: string): Promise<boolean> => {
  const savedPassword = await getPassword();
  return Boolean(savedPassword) && savedPassword === input;
};
