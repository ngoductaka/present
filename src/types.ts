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
export type MoodType =
  | 'vui_ve'
  | 'dam_me'
  | 'to_mo'
  | 'tu_tin'
  | 'buon_te'
  | 'lo_lang'
  | 'tri_hoan'
  | 'met_moi';

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

export type DiaryEmotion =
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'calm'
  | 'not_sure';

export type DiaryWeather = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export type DiaryBodyState = 'tired' | 'ill' | 'strong' | 'stressed';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  emotion?: DiaryEmotion;
  weather?: DiaryWeather;
  bodyStates: DiaryBodyState[];
  content: string;
  images: string[];
  timeMarkers: string[];
  createdAt: number;
  updatedAt: number;
}

export const DIARY_EMOTION_OPTIONS: Array<{
  id: DiaryEmotion;
  emoji: string;
  labelKey: string;
}> = [
  { id: 'happy', emoji: '😊', labelKey: 'diary.emotion.happy' },
  { id: 'sad', emoji: '😔', labelKey: 'diary.emotion.sad' },
  { id: 'anxious', emoji: '😰', labelKey: 'diary.emotion.anxious' },
  { id: 'calm', emoji: '😌', labelKey: 'diary.emotion.calm' },
  { id: 'not_sure', emoji: '🤔', labelKey: 'diary.emotion.notSure' },
];

export const DIARY_WEATHER_OPTIONS: Array<{
  id: DiaryWeather;
  icon: string;
  labelKey: string;
}> = [
  { id: 'sunny', icon: 'sunny-outline', labelKey: 'diary.weather.sunny' },
  { id: 'cloudy', icon: 'cloud-outline', labelKey: 'diary.weather.cloudy' },
  { id: 'rainy', icon: 'rainy-outline', labelKey: 'diary.weather.rainy' },
  { id: 'stormy', icon: 'thunderstorm-outline', labelKey: 'diary.weather.stormy' },
];

export const DIARY_BODY_STATE_OPTIONS: Array<{
  id: DiaryBodyState;
  icon: string;
  labelKey: string;
}> = [
  { id: 'tired', icon: 'moon-outline', labelKey: 'diary.body.tired' },
  { id: 'ill', icon: 'bandage-outline', labelKey: 'diary.body.ill' },
  { id: 'strong', icon: 'barbell-outline', labelKey: 'diary.body.strong' },
  { id: 'stressed', icon: 'flash-outline', labelKey: 'diary.body.stressed' },
];

export const MOOD_OPTIONS: Array<{
  type: MoodType;
  image: any;
  label: string;
  color: string;
  bgColor: string;
  score: number;
}> = [
  {
    type: 'vui_ve', image: require('../assets/moods/joy.png'),
    label: 'Vui vẻ', color: '#c59609', bgColor: '#FFF7D9', score: 5,
  },
  {
    type: 'dam_me', image: require('../assets/moods/dam_me.png'),
    label: 'Đam mê', color: '#35B56A', bgColor: '#EAF9EF', score: 4,
  },
  {
    type: 'to_mo', image: require('../assets/moods/to_mo.png'),
    label: 'Tò mò', color: '#8A63D2', bgColor: '#F3ECFF', score: 4,
  },
  {
    type: 'tu_tin', image: require('../assets/moods/tu_tin.png'),
    label: 'Tự tin', color: '#F28AA8', bgColor: '#FFF0F5', score: 5,
  },
  {
    type: 'buon_te', image: require('../assets/moods/buon_te.png'),
    label: 'Buồn tẻ', color: '#4B8FD9', bgColor: '#EAF3FF', score: 2,
  },
  {
    type: 'lo_lang', image: require('../assets/moods/lo_lang.png'),
    label: 'Lo lắng', color: '#F29C38', bgColor: '#FFF2E3', score: 2,
  },
  {
    type: 'tri_hoan', image: require('../assets/moods/tri_hoan.png'),
    label: 'Trì hoãn', color: '#5F6F86', bgColor: '#EEF1F5', score: 2,
  },
  {
    type: 'met_moi', image: require('../assets/moods/met_moi.png'),
    label: 'Mệt mỏi', color: '#E4573D', bgColor: '#FDECE8', score: 1,
  },
];

export const ACTIVITY_OPTIONS = [
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'study', emoji: '📚', label: 'Study' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'exercise', emoji: '🏃', label: 'Exercise' },
  { id: 'eat', emoji: '🍽️', label: 'Eating' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
  { id: 'commute', emoji: '🚗', label: 'Commute' },
  { id: 'shopping', emoji: '🛒', label: 'Shopping' },
  { id: 'housework', emoji: '🧹', label: 'Housework' },
  { id: 'relax', emoji: '🧘', label: 'Relax' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment' },
  { id: 'hobby', emoji: '🎨', label: 'Hobby' },
  { id: 'health', emoji: '🏥', label: 'Health' }
];
