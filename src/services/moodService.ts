import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MoodEntry,
  MoodStats,
  MoodType,
  MOOD_OPTIONS,
  normalizeMoodType,
} from '../types';

const MOOD_ENTRIES_KEY = '@mood_entries';

/**
 * Save a new mood entry
 */
export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  try {

    const entries = await getAllMoodEntries();
    console.log('Current mood entries before saving:', entries, entry);
    entries.unshift(entry); // Add to beginning (most recent first)
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

/**
 * Get all mood entries
 */
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
    console.log('Loaded mood entries:', data);
    if (!data) {
      return [];
    }

    return (JSON.parse(data) as Array<MoodEntry & { mood: string }>).flatMap(
      (entry) => {
        const mood = normalizeMoodType(entry.mood);

        if (!mood) {
          return [];
        }

        return [{ ...entry, mood }];
      }
    );
  } catch (error) {
    console.error('Error loading mood entries:', error);
    return [];
  }
};

/**
 * Get mood entries for a specific date range
 */
export const getMoodEntriesInRange = async (
  startDate: Date,
  endDate: Date
): Promise<MoodEntry[]> => {
  try {
    const allEntries = await getAllMoodEntries();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return allEntries.filter(
      (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  } catch (error) {
    console.error('Error getting mood entries in range:', error);
    return [];
  }
};

/**
 * Delete a mood entry by ID
 */
export const deleteMoodEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getAllMoodEntries();
    const filtered = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
};

/**
 * Calculate mood statistics for a date range
 */
export const calculateMoodStats = async (
  startDate: Date,
  endDate: Date
): Promise<MoodStats> => {
  try {
    const entries = await getMoodEntriesInRange(startDate, endDate);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        moodFrequency: MOOD_OPTIONS.reduce((acc, mood) => {
          acc[mood.type] = 0;
          return acc;
        }, {} as Record<MoodType, number>),
        topActivities: [],
        averageMoodScore: 0,
      };
    }

    // Calculate mood frequency
    const moodFrequency: Record<MoodType, number> = MOOD_OPTIONS.reduce((acc, mood) => {
      acc[mood.type] = 0;
      return acc;
    }, {} as Record<MoodType, number>);


    let totalScore = 0;
    const activityCount: Record<string, number> = {};

    entries.forEach((entry) => {
      // Count mood frequency
      if (entry.mood in moodFrequency) {
        moodFrequency[entry.mood as MoodType]++;
      }

      // Calculate score
      const moodOption = MOOD_OPTIONS.find((m) => m.type === entry.mood);
      if (moodOption) {
        totalScore += moodOption.score;
      }

      // Count activities
      entry.activities.forEach((activity) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
    });

    // Get top activities
    const topActivities = Object.entries(activityCount)
      .map(([activity, count]) => ({ activity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEntries: entries.length,
      moodFrequency,
      topActivities,
      averageMoodScore: totalScore / entries.length,
    };
  } catch (error) {
    console.error('Error calculating mood stats:', error);
    return {
      totalEntries: 0,
      moodFrequency: MOOD_OPTIONS.reduce((acc, mood) => {
        acc[mood.type] = 0;
        return acc;
      }, {} as Record<MoodType, number>),
      topActivities: [],
      averageMoodScore: 0,
    };
  }
};

/**
 * Get mood entries grouped by date
 */
export const getMoodEntriesByDate = async (): Promise<
  Record<string, MoodEntry[]>
> => {
  try {
    const entries = await getAllMoodEntries();
    const grouped: Record<string, MoodEntry[]> = {};

    entries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping mood entries:', error);
    return {};
  }
};

export const getLatestMoodByDate = async (): Promise<Record<string, MoodType>> => {
  try {
    const entries = await getAllMoodEntries();
    const latestMoodByDate: Record<string, MoodType> = {};

    entries.forEach((entry) => {
      const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];

      if (!latestMoodByDate[dateKey]) {
        latestMoodByDate[dateKey] = entry.mood;
      }
    });

    return latestMoodByDate;
  } catch (error) {
    console.error('Error getting latest mood by date:', error);
    return {};
  }
};
