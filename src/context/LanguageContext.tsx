import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, languageLocale, translate } from '../i18n/translations';

const STORAGE_KEY = '@app_language';

interface LanguageContextValue {
  language: Language;
  locale: string;
  setLanguage: (nextLanguage: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedLanguage === 'en' || storedLanguage === 'vi') {
          setLanguageState(storedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      locale: languageLocale[language],
      setLanguage,
      t: (key: string, params?: Record<string, string | number>) =>
        translate(language, key, params),
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
