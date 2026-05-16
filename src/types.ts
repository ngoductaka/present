export interface NotificationSettings {
  time: string; // HH:mm format
  isActive: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  time: '08:00',
  isActive: false,
};

// Mood Tracking Types
export type MoodType =
  | 'biet_on'
  | 'buon'
  | 'cang_thang'
  | 'chan_nam'
  | 'co_don'
  | 'gian_du'
  | 'hao_hung'
  | 'khong_ro'
  | 'lo_lang'
  | 'so_hai'
  | 'that_vong'
  | 'thoai_mai'
  | 'toi_loi'
  | 'tu_hao'
  | 'vui_ve'
  | 'xau_ho';

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

export type DiaryEmotion = MoodType;

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

const moodAssetMap = {
  biet_on: require('../assets/icon_mochi/icon_biet_on.png'),
  buon: require('../assets/icon_mochi/icon_buon.png'),
  cang_thang: require('../assets/icon_mochi/icon_cang_thang.png'),
  chan_nam: require('../assets/icon_mochi/icon_chan_nam.png'),
  co_don: require('../assets/icon_mochi/icon_co_don.png'),
  gian_du: require('../assets/icon_mochi/icon_gian_du.png'),
  hao_hung: require('../assets/icon_mochi/icon_hao_hung.png'),
  khong_ro: require('../assets/icon_mochi/icon_khong_ro.png'),
  lo_lang: require('../assets/icon_mochi/icon_lo_lang.png'),
  so_hai: require('../assets/icon_mochi/icon_so_hai.png'),
  that_vong: require('../assets/icon_mochi/icon_that_vong.png'),
  thoai_mai: require('../assets/icon_mochi/icon_thoai_mai.png'),
  toi_loi: require('../assets/icon_mochi/icon_toi_loi.png'),
  tu_hao: require('../assets/icon_mochi/icon_tu_hao.png'),
  vui_ve: require('../assets/icon_mochi/icon_vui_ve.png'),
  xau_ho: require('../assets/icon_mochi/icon_xau_ho.png'),
} as const;

const legacyMoodTypeMap = {
  dam_me: 'hao_hung',
  to_mo: 'khong_ro',
  tu_tin: 'tu_hao',
  buon_te: 'chan_nam',
  tri_hoan: 'khong_ro',
  met_moi: 'cang_thang',
} as const;

const legacyDiaryEmotionMap = {
  happy: 'vui_ve',
  sad: 'buon',
  anxious: 'lo_lang',
  calm: 'thoai_mai',
  not_sure: 'khong_ro',
} as const;

const diaryEmotionIds: DiaryEmotion[] = [
  'vui_ve',
  'biet_on',
  'hao_hung',
  'tu_hao',
  'thoai_mai',
  'khong_ro',
  'lo_lang',
  'so_hai',
  'buon',
  'chan_nam',
  'co_don',
  'that_vong',
  'cang_thang',
  'gian_du',
  'toi_loi',
  'xau_ho',
];

export const normalizeMoodType = (value?: string | null): MoodType | undefined => {
  if (!value) {
    return undefined;
  }

  if (value in moodAssetMap) {
    return value as MoodType;
  }

  if (value in legacyMoodTypeMap) {
    return legacyMoodTypeMap[value as keyof typeof legacyMoodTypeMap];
  }

  return undefined;
};

export const normalizeDiaryEmotion = (
  value?: string | null
): DiaryEmotion | undefined => {
  if (!value) {
    return undefined;
  }

  const normalizedMood = normalizeMoodType(value);
  if (normalizedMood) {
    return normalizedMood;
  }

  if (value in legacyDiaryEmotionMap) {
    return legacyDiaryEmotionMap[value as keyof typeof legacyDiaryEmotionMap];
  }

  return undefined;
};

export const DIARY_EMOTION_OPTIONS: Array<{
  id: DiaryEmotion;
  image: any;
  labelKey: string;
}> = diaryEmotionIds.map((id) => ({
  id,
  image: moodAssetMap[id],
  labelKey: `diary.emotion.${id}`,
}));

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
    type: 'vui_ve', image: moodAssetMap.vui_ve,
    label: 'Vui vẻ', color: '#c59609', bgColor: '#FFF7D9', score: 5,
  },
  {
    type: 'biet_on', image: moodAssetMap.biet_on,
    label: 'Biết ơn', color: '#a47a10', bgColor: '#fff4d8', score: 5,
  },
  {
    type: 'hao_hung', image: moodAssetMap.hao_hung,
    label: 'Háo hức', color: '#35B56A', bgColor: '#EAF9EF', score: 5,
  },
  {
    type: 'tu_hao', image: moodAssetMap.tu_hao,
    label: 'Tự hào', color: '#F28AA8', bgColor: '#FFF0F5', score: 5,
  },
  {
    type: 'thoai_mai', image: moodAssetMap.thoai_mai,
    label: 'Thoải mái', color: '#2a9d8f', bgColor: '#e5f7f4', score: 4,
  },
  {
    type: 'khong_ro', image: moodAssetMap.khong_ro,
    label: 'Không rõ', color: '#8A63D2', bgColor: '#F3ECFF', score: 3,
  },
  {
    type: 'lo_lang', image: moodAssetMap.lo_lang,
    label: 'Lo lắng', color: '#F29C38', bgColor: '#FFF2E3', score: 2,
  },
  {
    type: 'so_hai', image: moodAssetMap.so_hai,
    label: 'Sợ hãi', color: '#bb7a2b', bgColor: '#fff1e0', score: 1,
  },
  {
    type: 'buon', image: moodAssetMap.buon,
    label: 'Buồn', color: '#4B8FD9', bgColor: '#EAF3FF', score: 2,
  },
  {
    type: 'chan_nam', image: moodAssetMap.chan_nam,
    label: 'Chán nản', color: '#6f87c8', bgColor: '#edf3ff', score: 2,
  },
  {
    type: 'co_don', image: moodAssetMap.co_don,
    label: 'Cô đơn', color: '#6470b8', bgColor: '#eef0ff', score: 1,
  },
  {
    type: 'that_vong', image: moodAssetMap.that_vong,
    label: 'Thất vọng', color: '#56708f', bgColor: '#ecf1f6', score: 1,
  },
  {
    type: 'cang_thang', image: moodAssetMap.cang_thang,
    label: 'Căng thẳng', color: '#E4573D', bgColor: '#FDECE8', score: 1,
  },
  {
    type: 'gian_du', image: moodAssetMap.gian_du,
    label: 'Giận dữ', color: '#d84f42', bgColor: '#fde9e6', score: 1,
  },
  {
    type: 'toi_loi', image: moodAssetMap.toi_loi,
    label: 'Tội lỗi', color: '#8a6c63', bgColor: '#f5ece8', score: 1,
  },
  {
    type: 'xau_ho', image: moodAssetMap.xau_ho,
    label: 'Xấu hổ', color: '#c8788f', bgColor: '#fceef2', score: 2,
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
