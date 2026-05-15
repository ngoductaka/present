import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { DiaryEntry, DiaryEmotion } from '../types';

const DIARY_ENTRIES_KEY = '@diary_entries';
const DIARY_IMAGE_DIRECTORY = `${FileSystem.documentDirectory ?? ''}diary-images`;

const readDiaryEntries = async (): Promise<Record<string, DiaryEntry>> => {
  try {
    const data = await AsyncStorage.getItem(DIARY_ENTRIES_KEY);
    return data ? (JSON.parse(data) as Record<string, DiaryEntry>) : {};
  } catch (error) {
    console.error('Error loading diary entries:', error);
    return {};
  }
};

const writeDiaryEntries = async (entries: Record<string, DiaryEntry>) => {
  await AsyncStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries));
};

const ensureImageDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable');
  }

  const directoryInfo = await FileSystem.getInfoAsync(DIARY_IMAGE_DIRECTORY);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(DIARY_IMAGE_DIRECTORY, {
      intermediates: true,
    });
  }
};

const getFileExtension = (uri: string) => {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
};

export const createEmptyDiaryEntry = (date: string): DiaryEntry => {
  const now = Date.now();

  return {
    id: date,
    date,
    bodyStates: [],
    content: '',
    images: [],
    timeMarkers: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const isDiaryEntryEmpty = (entry: DiaryEntry) =>
  !entry.emotion &&
  !entry.weather &&
  entry.bodyStates.length === 0 &&
  entry.content.trim().length === 0 &&
  entry.images.length === 0 &&
  entry.timeMarkers.length === 0;

export const getDiaryEntryByDate = async (
  date: string
): Promise<DiaryEntry | null> => {
  const entries = await readDiaryEntries();
  return entries[date] ?? null;
};

export const getDiaryEntryDates = async (): Promise<string[]> => {
  const entries = await readDiaryEntries();
  return Object.keys(entries).sort();
};

export const getDiaryEmotionByDate = async (): Promise<
  Partial<Record<string, DiaryEmotion>>
> => {
  try {
    const entries = await readDiaryEntries();
    const emotionByDate: Partial<Record<string, DiaryEmotion>> = {};

    Object.values(entries).forEach((entry) => {
      if (entry.emotion) {
        emotionByDate[entry.date] = entry.emotion;
      }
    });

    return emotionByDate;
  } catch (error) {
    console.error('Error loading diary emotion by date:', error);
    return {};
  }
};

export const deleteDiaryEntryByDate = async (date: string): Promise<void> => {
  try {
    const entries = await readDiaryEntries();
    delete entries[date];
    await writeDiaryEntries(entries);
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
};

export const upsertDiaryEntry = async (entry: DiaryEntry): Promise<DiaryEntry> => {
  try {
    const entries = await readDiaryEntries();
    const existingEntry = entries[entry.date];
    const nextEntry: DiaryEntry = {
      ...entry,
      createdAt: existingEntry?.createdAt ?? entry.createdAt,
      updatedAt: Date.now(),
    };

    entries[entry.date] = nextEntry;
    await writeDiaryEntries(entries);

    return nextEntry;
  } catch (error) {
    console.error('Error saving diary entry:', error);
    throw error;
  }
};

export const storeDiaryImageAsync = async (sourceUri: string): Promise<string> => {
  try {
    await ensureImageDirectory();
    const extension = getFileExtension(sourceUri);
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;
    const destinationUri = `${DIARY_IMAGE_DIRECTORY}/${fileName}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Error storing diary image:', error);
    throw error;
  }
};

export const deleteDiaryImageAsync = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting diary image:', error);
  }
};
