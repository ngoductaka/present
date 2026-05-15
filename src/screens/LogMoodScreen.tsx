import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../context/LanguageContext';
import { HomeCalendar } from '../components/HomeCalendar';
import { RootStackParamList } from '../navigation/types';
import { getDiaryEntryDates, getDiaryEmotionByDate } from '../services/diaryService';
import { getLatestMoodByDate } from '../services/moodService';
import { DiaryEmotion, MoodType } from '../types';

const backgroundImage = require('../../assets/bg1.jpg');

type LogMoodScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const LogMoodScreen = ({ navigation }: LogMoodScreenProps) => {
  const { t, locale } = useLanguage();
  const [entryDates, setEntryDates] = React.useState<string[]>([]);
  const [moodByDate, setMoodByDate] = React.useState<
    Partial<Record<string, MoodType>>
  >({});
  const [emotionByDate, setEmotionByDate] = React.useState<
    Partial<Record<string, DiaryEmotion>>
  >({});

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadCalendarData = async () => {
        const [dates, moods, emotions] = await Promise.all([
          getDiaryEntryDates(),
          getLatestMoodByDate(),
          getDiaryEmotionByDate(),
        ]);

        if (isActive) {
          setEntryDates(dates);
          setMoodByDate(moods);
          setEmotionByDate(emotions);
        }
      };

      void loadCalendarData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <Text style={styles.title}>{t('logMood.title')}</Text>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.calendarWrap}>
            <HomeCalendar
              locale={locale}
              entryDates={entryDates}
              moodByDate={moodByDate}
              emotionByDate={emotionByDate}
              onDatePress={(date) => navigation.navigate('DiaryEntry', { date })}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 10,
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
