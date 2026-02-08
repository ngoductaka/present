# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Notifications Not Appearing

#### Check Permissions
**Problem**: Notifications don't show up at scheduled times.

**Solutions**:
- **Android**:
  1. Go to Settings → Apps → Expo Go (or your app)
  2. Tap "Notifications"
  3. Ensure notifications are enabled
  4. Check that "Do Not Disturb" is off

- **iOS**:
  1. Go to Settings → Notifications → Expo Go (or your app)
  2. Enable "Allow Notifications"
  3. Enable "Sounds"
  4. Set "Alert Style" to "Banners" or "Alerts"
  5. Check that "Do Not Disturb" is off

#### Verify Time Settings
- Make sure the start time is in the future (at least 1-2 minutes ahead)
- Ensure end time is after start time
- Check that current time is within the scheduled range

#### Test Immediately
```typescript
// Set start time to: current time + 2 minutes
// Set end time to: current time + 1 hour
// This ensures you'll get a notification soon
```

### 2. App Won't Load on Phone

#### Network Issues
**Problem**: QR code scanned but app won't load.

**Solutions**:
1. Ensure phone and computer are on the **same WiFi network**
2. Disable VPN on both devices
3. Check firewall settings (allow port 8081)
4. Try restarting the Metro bundler:
   ```bash
   # Press Ctrl+C to stop
   npm start
   ```

#### Expo Go Issues
**Problem**: Expo Go app crashes or shows errors.

**Solutions**:
1. Update Expo Go to the latest version
2. Clear Expo Go cache:
   - Android: Settings → Apps → Expo Go → Storage → Clear Cache
   - iOS: Delete and reinstall Expo Go
3. Restart your phone

### 3. TypeScript Errors

#### Module Not Found
**Problem**: `Cannot find module 'expo-notifications'` or similar.

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Or use
npm install --force
```

#### Type Errors
**Problem**: TypeScript compilation errors.

**Solution**:
```bash
# Clear TypeScript cache
rm -rf .expo
npm start -- --clear
```

### 4. Build Errors

#### EAS Build Fails
**Problem**: Build fails with errors.

**Solutions**:
1. Ensure you're logged in to Expo:
   ```bash
   eas login
   ```

2. Update EAS CLI:
   ```bash
   npm install -g eas-cli@latest
   ```

3. Check app.json configuration:
   - Verify `bundleIdentifier` (iOS) is unique
   - Verify `package` (Android) is unique

4. Clear build cache:
   ```bash
   eas build --platform android --clear-cache
   ```

### 5. Time Picker Issues

#### iOS Time Picker Not Showing
**Problem**: Time picker doesn't appear on iOS.

**Solution**:
- The iOS time picker appears **inline** (not as a popup)
- Scroll down if you don't see it
- Look for the spinner-style picker
- Tap "Done" when finished

#### Android Time Picker Closes Immediately
**Problem**: Time picker dialog closes without selecting time.

**Solution**:
- Make sure to tap "OK" button
- Don't tap outside the dialog
- Update `@react-native-community/datetimepicker` if issue persists:
  ```bash
  npx expo install @react-native-community/datetimepicker@latest
  ```

### 6. Storage Issues

#### Settings Not Persisting
**Problem**: Settings reset when app is closed.

**Solutions**:
1. Check AsyncStorage permissions
2. Clear app data and try again:
   - Android: Settings → Apps → [App] → Storage → Clear Data
   - iOS: Delete and reinstall app

3. Verify storage implementation:
   ```bash
   # Check if AsyncStorage is installed
   npm list @react-native-async-storage/async-storage
   ```

### 7. Sound Not Playing

#### No Sound on Notifications
**Problem**: Notifications appear but no sound plays.

**Solutions**:
1. **Check device volume**:
   - Ensure volume is up
   - Check that device is not in silent mode
   - On iOS, check the physical silent switch

2. **Check notification settings**:
   - Android: Settings → Apps → [App] → Notifications → Sound
   - iOS: Settings → Notifications → [App] → Sounds

3. **Test with different sound**:
   - Edit `src/services/notificationService.ts`
   - Change `sound: 'default'` to `sound: null` then back to `'default'`

### 8. Background Notifications Not Working

#### Notifications Stop When App Closes
**Problem**: Notifications only work when app is open.

**Solutions**:

**For Expo Go**:
- Background notifications have limitations in Expo Go
- Build a development build for full functionality:
  ```bash
  npx expo run:android
  # or
  npx expo run:ios
  ```

**For Production Build**:
1. Ensure proper permissions in `app.json`
2. For iOS, add background modes:
   ```json
   "ios": {
     "infoPlist": {
       "UIBackgroundModes": ["remote-notification"]
     }
   }
   ```

3. For Android, ensure permissions:
   ```json
   "android": {
     "permissions": [
       "RECEIVE_BOOT_COMPLETED",
       "VIBRATE",
       "POST_NOTIFICATIONS"
     ]
   }
   ```

### 9. Duplicate Notifications

#### Getting Multiple Notifications at Same Time
**Problem**: Same notification appears multiple times.

**Solution**:
1. Stop all notifications:
   - Tap "Stop Notifications" in the app
   
2. Clear scheduled notifications manually:
   ```typescript
   // In the app, this is done automatically
   // But you can verify by checking the count
   ```

3. Restart the app and schedule again

### 10. Performance Issues

#### App is Slow or Laggy
**Problem**: App performance is poor.

**Solutions**:
1. Clear Metro bundler cache:
   ```bash
   npm start -- --clear
   ```

2. Reduce number of scheduled notifications:
   - Use longer intervals
   - Reduce time range

3. Close other apps on your device

4. Restart the development server

### 11. Android-Specific Issues

#### Notifications Not Showing on Android 13+
**Problem**: No notifications on Android 13 or higher.

**Solution**:
- Android 13+ requires explicit permission
- The app requests this automatically
- If denied, go to Settings → Apps → [App] → Permissions → Notifications

#### Notification Channel Issues
**Problem**: Can't change notification sound or importance.

**Solution**:
- Once a channel is created, settings are locked
- To change, you must:
  1. Uninstall the app
  2. Reinstall the app
  3. Or change the channel ID in `notificationService.ts`

### 12. iOS-Specific Issues

#### Notifications Not Showing on iOS
**Problem**: Notifications don't appear on iOS.

**Solutions**:
1. Check notification settings (Settings → Notifications)
2. Ensure app is not in "Do Not Disturb" mode
3. Check "Scheduled Summary" settings (iOS 15+)
4. Disable "Focus" modes that might block notifications

#### Sound Not Playing on iOS
**Problem**: Silent notifications on iOS.

**Solution**:
- Check the physical silent switch on the side of the device
- Go to Settings → Sounds & Haptics → ensure volume is up
- Check notification settings for the app

## 🆘 Still Having Issues?

### Debug Mode

Enable debug logging in `src/services/notificationService.ts`:

```typescript
// Add console.logs to track execution
console.log('Scheduling notification at:', time);
console.log('Notification count:', await getScheduledNotificationsCount());
```

### Check Scheduled Notifications

Add this to your app to see all scheduled notifications:

```typescript
import * as Notifications from 'expo-notifications';

const debugNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', JSON.stringify(scheduled, null, 2));
};
```

### Reset Everything

If all else fails:

```bash
# 1. Stop the server (Ctrl+C)

# 2. Clear all caches
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# 3. Reinstall
npm install

# 4. Start fresh
npm start -- --clear

# 5. On your device, delete and reinstall the app
```

## 📞 Getting Help

If you're still stuck:

1. **Check Expo documentation**: https://docs.expo.dev/
2. **Expo forums**: https://forums.expo.dev/
3. **GitHub issues**: Check if others have similar issues
4. **Stack Overflow**: Search for your specific error message

## 💡 Pro Tips

- Always test on a real device for notifications
- Keep Expo Go and dependencies updated
- Check device logs for detailed error messages
- Use development builds for production-like testing
- Test on both iOS and Android before releasing

---

**Remember**: Most notification issues are related to permissions or device settings, not the code!
