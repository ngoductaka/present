import React, { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuickMoodLogger } from '../components/QuickMoodLogger';
import { useLanguage } from '../context/LanguageContext';
import { HomeCalendar } from '../components/HomeCalendar';

export const LogMoodScreen = () => {
  const { t, locale } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [gradientColors, setGradientColors] = useState<
    [string, string, ...string[]]
  >(['#FAEBB6', '#DDE5B6', '#AFD9C9', '#C8E3E8', '#D7E8F0']);

  const handleMoodSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleMoodChange = (mood: any) => {
    if (!mood) {
      setGradientColors([
        '#FAEBB6',
        '#DDE5B6',
        '#AFD9C9',
        '#C8E3E8',
        '#D7E8F0',
      ]);
      return;
    }
    // Create a custom gradient for each mood using its colors
    setGradientColors([
      mood.bgColor,
      mood.color + '44', // Lower opacity version of the main color
      '#AFD9C9',
      '#C8E3E8',
    ]);
  };

  return (
    <ImageBackground
      source={require('../../assets/bg1.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={{ flex: 1, position: 'relative' }}>
        {/* <LinearGradient
        colors={gradientColors}
        style={styles.overlay}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      > */}
        <StatusBar style='dark' />
        {/* <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardContainer}
                > */}
        <Text style={styles.title}>{t('logMood.title')}</Text>
        <ScrollView
          contentContainerStyle={styles.content}
          // showsVerticalScrollIndicator={false}
          // keyboardShouldPersistTaps="handled"
          // keyboardDismissMode="on-drag"
          // style={{ flex: 1, backgroundColor: 'blue' }}
        >
          {/* <Text style={styles.title}>{t('logMood.title')}</Text> */}
          <View style={styles.calendarWrap}>
            <HomeCalendar locale={locale} />
          </View>
          {/* <QuickMoodLogger onSaved={handleMoodSaved} onMoodChange={handleMoodChange} /> */}
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
        {/* </LinearGradient> */}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'red',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#e0d1b8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  appName: {
    fontSize: 32,
    fontWeight: '300', // Light but elegant
    color: '#333',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 10,
    // paddingBottom: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  calendarWrap: {
    marginHorizontal: -20,
    marginBottom: 8,
  },
});
