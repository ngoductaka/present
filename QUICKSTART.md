# 🚀 Quick Start Guide

## Running the App Right Now

The development server is already running! Here's what to do:

### Option 1: Test on Your Phone (Recommended)

1. **Install Expo Go** on your phone:
   - **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan the QR Code**:
   - **Android**: Open Expo Go app and scan the QR code in the terminal
   - **iOS**: Open Camera app and scan the QR code, then tap the notification

3. **Wait for the app to load** (first time may take a minute)

### Option 2: Test on Simulator/Emulator

#### iOS Simulator (Mac only)
```bash
# Press 'i' in the terminal where the server is running
# OR run this command in a new terminal:
npm run ios
```

#### Android Emulator
```bash
# Make sure you have Android Studio and an emulator running
# Press 'a' in the terminal where the server is running
# OR run this command in a new terminal:
npm run android
```

## Testing the Notifications

Once the app loads:

1. **Set Start Time**: Tap on "Start Time" and select a time (e.g., current time + 2 minutes)
2. **Set End Time**: Tap on "End Time" and select a later time (e.g., current time + 1 hour)
3. **Choose Interval**: Select either "30 min" or "1 hour"
4. **Start**: Tap "Start Notifications"
5. **Grant Permission**: When prompted, allow notifications
6. **Test Background**: Close the app completely and wait for the notification time

## Important Notes

### For Real Device Testing
- Make sure your phone and computer are on the **same WiFi network**
- If the QR code doesn't work, try typing the URL manually in Expo Go

### For Notification Testing
- **Android**: Notifications work immediately in Expo Go
- **iOS**: Notifications work in Expo Go but may have limitations
- For full notification features, build a development build:
  ```bash
  npx expo run:ios
  # or
  npx expo run:android
  ```

### Troubleshooting

**App won't load?**
- Check that your phone and computer are on the same network
- Try restarting the Metro bundler (Ctrl+C, then `npm start`)

**Notifications not working?**
- Make sure you granted notification permissions
- Check that your device is not in Do Not Disturb mode
- Verify the start time is in the future

**Time picker not showing?**
- On iOS, the picker appears inline - scroll down if needed
- On Android, it appears as a dialog

## Next Steps

1. **Customize the app**: Edit `App.tsx` to change the UI
2. **Modify notifications**: Edit `src/services/notificationService.ts`
3. **Build for production**: See README.md for build instructions

## Stop the Server

When you're done testing:
```bash
# Press Ctrl+C in the terminal where the server is running
```

---

**Need help?** Check the full README.md for detailed documentation!
