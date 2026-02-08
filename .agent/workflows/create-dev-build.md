---
description: Create a development build for Android
---

# Create Development Build

This workflow creates a development build that runs natively on your device (instead of Expo Go).

## Prerequisites
- EAS CLI installed globally
- Expo account created and logged in

## Steps

1. Install EAS CLI globally (if not already installed)
```bash
npm install -g eas-cli
```

2. Login to your Expo account
```bash
eas login
```

3. Configure the project for EAS Build
```bash
eas build:configure
```

4. Create a development build for Android
```bash
eas build --profile development --platform android
```

5. Once the build completes, download and install the APK on your Android device

6. Start the development server
```bash
npx expo start --dev-client
```

7. Scan the QR code with your development build app

## Notes
- Development builds include native code and run like a production app
- They support all features including background notifications
- You only need to rebuild when you add/remove native dependencies
- For daily development, just use `npx expo start --dev-client`
