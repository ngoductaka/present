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
export type MoodType = 'joy' | 'sadness' | 'anger' | 'fear' | 'anxiety' | 'ennui' | 'embarrassment' | 'envy';

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
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  label: string;
  color: string;
  bgColor: string;
  score: number;
}> = [
    {
      type: 'joy', icon: 'sunny', iconFamily: 'Ionicons',
      label: 'Joy', color: '#f1c40f', bgColor: '#fef9e7', score: 5
    },
    {
      type: 'sadness', icon: 'water', iconFamily: 'Ionicons',
      label: 'Sadness', color: '#3498db', bgColor: '#ebf5fb', score: 2
    },
    {
      type: 'anger', icon: 'flame', iconFamily: 'Ionicons',
      label: 'Anger', color: '#e74c3c', bgColor: '#faeaea', score: 1
    },
    {
      type: 'fear', icon: 'skull', iconFamily: 'Ionicons',
      label: 'Fear', color: '#9b59b6', bgColor: '#f5eef8', score: 2
    },
    {
      type: 'anxiety', icon: 'flash', iconFamily: 'Ionicons',
      label: 'Anxiety', color: '#e67e22', bgColor: '#fdf2e9', score: 2
    },
    {
      type: 'ennui', icon: 'bed', iconFamily: 'Ionicons',
      label: 'Ennui', color: '#34495e', bgColor: '#ebedef', score: 3
    },
    {
      type: 'embarrassment', icon: 'happy-outline', iconFamily: 'Ionicons',
      label: 'Embarrassment', color: '#ff85a2', bgColor: '#fff0f3', score: 2
    },
    {
      type: 'envy', icon: 'eye', iconFamily: 'Ionicons',
      label: 'Envy', color: '#16a085', bgColor: '#e8f8f5', score: 2
    },
  ];

export const ACTIVITY_OPTIONS = [
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'gaming', emoji: '🎮', label: 'Game' },
  { id: 'sport', emoji: '⚽', label: 'Sport' },
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
];

