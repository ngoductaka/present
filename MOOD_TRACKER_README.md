# 🌟 Mood & Activity Tracker

A comprehensive wellness app that combines mood tracking, activity logging, and smart notifications to help you understand and improve your emotional well-being.

## ✨ Features

### 1. **Quick Mood Logging** 📝
- **One-tap mood selection** with 5 emoji-based mood options:
  - 😄 Amazing
  - 🙂 Good
  - 😐 Okay
  - 😟 Bad
  - 😢 Terrible
- **Activity tracking** with 12 pre-defined activities (work, exercise, social, etc.)
- **Optional notes** to capture thoughts and context (up to 200 characters)
- **Automatic timestamps** for every entry
- **Beautiful animations** for delightful user experience

### 2. **Mood History** 📖
- **Timeline view** of all your mood entries
- **Grouped by date** for easy navigation
- **Detailed entry cards** showing:
  - Mood with color-coded indicators
  - Time of entry
  - Activities performed
  - Personal notes
- **Delete functionality** to manage your entries
- **Empty state guidance** for new users

### 3. **Analytics Dashboard** 📊
- **Time range filters**: Today, Last 7 Days, Last 30 Days
- **Summary statistics**:
  - Total entries count
  - Average mood score (1-5 scale)
  - Mood quality rating (Excellent, Good, Fair, Poor)
- **Mood distribution chart** with visual bars
- **Top 5 activities** ranked by frequency
- **AI-like insights** based on your patterns:
  - Positive reinforcement for good moods
  - Encouragement during tough times
  - Activity pattern recognition

### 4. **Smart Reminders** ⏰
- **Customizable notification schedule**
- **Time range selection** (start and end times)
- **Interval options**: 30 minutes or 1 hour
- **Background notifications** that work even when app is closed
- **Sound alerts** to ensure you never miss a check-in

## 🎨 Design Highlights

- **Modern iOS-style design** with clean, minimalist aesthetics
- **Color-coded moods** for instant visual recognition
- **Smooth animations** and micro-interactions
- **Responsive layout** optimized for mobile devices
- **Emoji-based navigation** in bottom tabs
- **Card-based UI** with subtle shadows and rounded corners
- **Consistent spacing** and typography throughout

## 📱 Navigation

The app uses a **bottom tab navigation** with 4 main screens:

1. **✨ Log Mood** - Quick entry screen for logging current mood
2. **📖 History** - Timeline of all past mood entries
3. **📊 Analytics** - Visual insights and statistics
4. **⏰ Reminders** - Notification scheduler settings

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```

Then scan the QR code with Expo Go on your device.

### First-Time Setup
1. **Grant notification permissions** when prompted
2. **Log your first mood** in the "Log Mood" tab
3. **Set up reminders** in the "Reminders" tab (optional)
4. **Check your analytics** after logging a few entries

## 💾 Data Storage

All data is stored **locally on your device** using AsyncStorage:
- **Mood entries** with timestamps, activities, and notes
- **Notification settings** for persistent reminders
- **No cloud sync** - your data stays private and secure

## 🎯 Use Cases

### Daily Wellness Tracking
- Log your mood 2-3 times per day
- Track patterns over weeks and months
- Identify activities that boost your mood

### Mental Health Awareness
- Monitor emotional trends
- Share insights with therapists or counselors
- Build self-awareness through reflection

### Productivity Optimization
- Correlate mood with activities
- Find your peak performance times
- Balance work and relaxation

### Habit Building
- Set reminders to check in regularly
- Build a consistent logging habit
- Celebrate positive mood streaks

## 📊 Analytics Insights

The app provides intelligent insights such as:
- **Mood trends** over time
- **Activity correlations** with mood states
- **Frequency analysis** of different moods
- **Personalized encouragement** based on patterns

## 🔔 Notification Features

- **Local notifications** (no server required)
- **Customizable intervals** (30 or 60 minutes)
- **Daily time windows** to avoid late-night alerts
- **Persistent scheduling** across app restarts
- **Sound and vibration** for better attention

## 🛠️ Technical Stack

- **React Native** with Expo SDK 54
- **React Navigation** for bottom tabs
- **AsyncStorage** for local data persistence
- **Expo Notifications** for local reminders
- **TypeScript** for type safety
- **Custom components** for reusability

## 📝 Data Structure

### Mood Entry
```typescript
{
  id: string;           // Unique identifier
  mood: MoodType;       // 'amazing' | 'good' | 'okay' | 'bad' | 'terrible'
  activities: string[]; // Array of activity IDs
  note?: string;        // Optional text note
  timestamp: number;    // Unix timestamp
}
```

### Mood Statistics
```typescript
{
  totalEntries: number;
  moodFrequency: Record<MoodType, number>;
  topActivities: Array<{ activity: string; count: number }>;
  averageMoodScore: number; // 1-5 scale
}
```

## 🎨 Color Palette

- **Amazing**: `#4CAF50` (Green)
- **Good**: `#8BC34A` (Light Green)
- **Okay**: `#FFC107` (Amber)
- **Bad**: `#FF9800` (Orange)
- **Terrible**: `#F44336` (Red)
- **Primary**: `#007AFF` (iOS Blue)
- **Background**: `#f5f5f5` (Light Gray)

## 🔒 Privacy

- **100% local storage** - no data leaves your device
- **No account required** - start using immediately
- **No analytics tracking** - your privacy is respected
- **No internet required** - works completely offline

## 🐛 Troubleshooting

### Notifications not appearing?
1. Check device notification permissions
2. Ensure "Do Not Disturb" is off
3. Verify time range includes current time
4. See `TROUBLESHOOTING.md` for detailed help

### Data not saving?
1. Check AsyncStorage permissions
2. Try clearing app data and restarting
3. Ensure sufficient device storage

### App crashes or errors?
1. Clear Metro bundler cache: `npm start -- --clear`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check `TROUBLESHOOTING.md` for common issues

## 🚀 Future Enhancements

Potential features for future versions:
- **Calendar view** for mood entries
- **Export data** to CSV or JSON
- **Custom activities** and moods
- **Mood prediction** using ML
- **Streak tracking** and achievements
- **Dark mode** support
- **Cloud backup** (optional)
- **Sharing insights** with friends/family

## 📄 License

This project is private and for personal use.

## 🙏 Acknowledgments

Built with ❤️ using:
- Expo
- React Native
- React Navigation
- AsyncStorage

---

**Start tracking your mood today and discover patterns that lead to a happier, healthier you!** ✨
