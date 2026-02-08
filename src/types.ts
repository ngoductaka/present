export interface NotificationSettings {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  interval: 30 | 60; // minutes
  isActive: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  startTime: '08:00',
  endTime: '20:00',
  interval: 60,
  isActive: false,
};

// Mood Tracking Types
export type MoodType = 'amazing' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  activities: string[];
  note?: string;
  timestamp: number; // Unix timestamp
}

export interface MoodStats {
  totalEntries: number;
  moodFrequency: Record<MoodType, number>;
  topActivities: Array<{ activity: string; count: number }>;
  averageMoodScore: number; // 1-5 scale
}

export const MOOD_OPTIONS: Array<{
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  score: number;
}> = [
  { type: 'amazing', emoji: '😄', label: 'Amazing', color: '#4CAF50', score: 5 },
  { type: 'good', emoji: '🙂', label: 'Good', color: '#8BC34A', score: 4 },
  { type: 'okay', emoji: '😐', label: 'Okay', color: '#FFC107', score: 3 },
  { type: 'bad', emoji: '😟', label: 'Bad', color: '#FF9800', score: 2 },
  { type: 'terrible', emoji: '😢', label: 'Terrible', color: '#F44336', score: 1 },
];

export const ACTIVITY_OPTIONS = [
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'exercise', emoji: '🏃', label: 'Exercise' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'relax', emoji: '🧘', label: 'Relax' },
  { id: 'eat', emoji: '🍽️', label: 'Eating' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
  { id: 'hobby', emoji: '🎨', label: 'Hobby' },
  { id: 'study', emoji: '📚', label: 'Study' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'gaming', emoji: '🎮', label: 'Gaming' },
];
