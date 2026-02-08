# 📱 Notification Scheduler App

A React Native mobile app built with Expo that sends local notifications with sound at fixed intervals within a user-defined time range.

## ✨ Features

- ⏰ **Scheduled Notifications**: Set notifications to repeat every 30 minutes or 1 hour
- 🕐 **Time Range Control**: Define start and end times for notifications
- 🔔 **Sound Alerts**: Notifications play sound even when app is closed
- 💾 **Persistent Settings**: Your preferences are saved automatically
- 📱 **Cross-Platform**: Works on both Android (10+) and iOS (13+)
- 🎨 **Clean UI**: Modern, intuitive interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` (limited functionality - notifications won't work)

### Building for Production

#### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

#### iOS (IPA)

```bash
# Build for iOS
eas build --platform ios --profile preview
```

## 📖 How to Use

1. **Set Start Time**: Choose when notifications should begin (e.g., 08:00)
2. **Set End Time**: Choose when notifications should stop (e.g., 20:00)
3. **Select Interval**: Choose between 30 minutes or 1 hour intervals
4. **Start Notifications**: Tap "Start Notifications" to schedule
5. **Stop Notifications**: Tap "Stop Notifications" to cancel all

### Example

- **Start Time**: 08:00
- **End Time**: 20:00
- **Interval**: 1 hour

**Result**: Notifications at 08:00, 09:00, 10:00, ..., 20:00 (13 notifications per day)

## 🛠️ Technical Details

### Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Notifications**: expo-notifications
- **Storage**: @react-native-async-storage/async-storage
- **Date/Time Picker**: @react-native-community/datetimepicker

### Project Structure

```
.
├── App.tsx                          # Main app component
├── src/
│   ├── components/
│   │   ├── TimePicker.tsx          # Time selection component
│   │   └── IntervalSelector.tsx    # Interval selection component
│   ├── services/
│   │   └── notificationService.ts  # Notification scheduling logic
│   ├── utils/
│   │   └── storage.ts              # AsyncStorage utilities
│   └── types.ts                    # TypeScript type definitions
├── app.json                        # Expo configuration
└── package.json                    # Dependencies
```

### Key Features Implementation

#### Notification Scheduling
- Uses `expo-notifications` with calendar-based triggers
- Schedules daily repeating notifications at specific hours/minutes
- Automatically handles permission requests for iOS and Android

#### Time Range Validation
- Ensures end time is after start time
- Calculates all notification times within the range
- Prevents duplicate scheduling

#### Persistent Storage
- Saves user settings using AsyncStorage
- Restores settings on app launch
- Maintains notification state

## 🔧 Troubleshooting

### Notifications Not Appearing

1. **Check Permissions**: Ensure notification permissions are granted in device settings
2. **Android**: Make sure "Do Not Disturb" mode is off
3. **iOS**: Check that notifications are enabled in Settings > Notifications > [App Name]

### Time Picker Not Showing (iOS)

- The iOS time picker uses a spinner interface that appears inline
- Tap "Done" after selecting a time

### App Crashes on Launch

- Clear app data and reinstall
- Check that all dependencies are installed: `npm install`

## 📝 Development Notes

### Testing Notifications

- **Immediate Testing**: Set start time to current time + 1 minute
- **Background Testing**: Close the app completely to test background notifications
- **Sound Testing**: Ensure device volume is up and not in silent mode

### Modifying Notification Content

Edit `src/services/notificationService.ts`:

```typescript
content: {
  title: 'Your Custom Title',
  body: 'Your custom message',
  sound: 'default',
}
```

### Changing Default Settings

Edit `src/types.ts`:

```typescript
export const DEFAULT_SETTINGS: NotificationSettings = {
  startTime: '08:00',  // Change default start time
  endTime: '20:00',    // Change default end time
  interval: 60,        // Change default interval (30 or 60)
  isActive: false,
};
```

## 📱 Platform-Specific Notes

### Android
- Requires `POST_NOTIFICATIONS` permission (Android 13+)
- Uses notification channels for better control
- Notifications persist after device restart with `RECEIVE_BOOT_COMPLETED`

### iOS
- Requires user permission prompt
- Background notifications require proper entitlements
- Sound files must be in supported formats

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Uses [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- UI inspired by modern mobile design patterns
