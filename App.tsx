import React from 'react';
import { AppState, Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogMoodScreen as HomeScreen } from './src/screens/LogMoodScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { DiaryEntryScreen } from './src/screens/DiaryEntryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import * as SplashScreen from 'expo-splash-screen';
import { AppLockScreen } from './src/components/AppLockScreen';
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { RootStackParamList } from './src/navigation/types';
import { hasPassword, verifyPassword } from './src/utils/passwordStorage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const AppContent = () => {
  const { t } = useLanguage();
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);
  const [checkingLock, setCheckingLock] = React.useState(true);
  const [passwordEnabled, setPasswordEnabled] = React.useState(false);
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [unlocking, setUnlocking] = React.useState(false);
  const [unlockError, setUnlockError] = React.useState<string | null>(null);
  const appStateRef = React.useRef(AppState.currentState);
  const [bgIndex, setBgIndex] = React.useState(1);
  const bgOpacity = React.useRef(new Animated.Value(1)).current;
  const bgImages = React.useMemo(
    () => [
      require('./assets/bg/bg1.jpg'),
      require('./assets/bg/bg2.jpg'),
      require('./assets/bg/bg3.jpg'),
      require('./assets/bg/bg4.jpg'),
      require('./assets/bg/bg5.jpg'),
      require('./assets/bg/bg6.jpg'),
      require('./assets/bg/bg7.jpg'),
    ],
    [],
  );
  const backgroundImage = bgImages[bgIndex - 1];

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Update the image
        setBgIndex((current) => {
          if (current === 7) {
            return 1;
          }
          return current + 1;
        });
        // Fade in
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 123 * 1000);

    return () => clearInterval(interval);
  }, [bgOpacity]);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        // Hide the native splash screen as soon as the app is "ready"
        // Our custom splash screen will still be visible
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  React.useEffect(() => {
    const syncPasswordState = async () => {
      const enabled = await hasPassword();
      setPasswordEnabled(enabled);
      setIsUnlocked(!enabled);
      setCheckingLock(false);
    };

    void syncPasswordState();
  }, []);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        previousState.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        const enabled = await hasPassword();
        setPasswordEnabled(enabled);

        if (enabled) {
          setIsUnlocked(false);
          setUnlockError(null);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const handleSplashScreenFinish = () => {
    setShowSplashScreen(false);
  };

  const handleUnlock = async (password: string) => {
    try {
      setUnlocking(true);
      setUnlockError(null);
      const isValid = await verifyPassword(password);

      if (!isValid) {
        setUnlockError(t('auth.invalidPassword'));
        return;
      }

      setIsUnlocked(true);
    } finally {
      setUnlocking(false);
    }
  };

  if (!appIsReady || checkingLock) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AnimatedImageBackground
        source={backgroundImage}
        style={[styles.container, styles.absoluteFill, { opacity: bgOpacity }]}
        imageStyle={styles.backgroundImage}
      />
      <SafeAreaProvider>
        {showSplashScreen ? (
          <CustomSplashScreen onFinish={handleSplashScreenFinish} />
        ) : passwordEnabled && !isUnlocked ? (
          <AppLockScreen
            error={unlockError}
            loading={unlocking}
            onSubmit={(password) => {
              void handleUnlock(password);
            }}
          />
        ) : (
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: 'transparent',
                },
                headerTransparent: true,
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
                headerTintColor: '#007AFF',
                headerShadowVisible: true,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  headerTitle: t('header.history'),
                }}
              />
              <Stack.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                  headerTitle: t('header.analytics'),
                }}
              />
              {/* <Stack.Screen
                name="Charts"
                component={ChartsScreen}
                options={{
                  headerShown: false,
                }}
              /> */}
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                  headerTitle: t('header.reminders'),
                }}
              />
              <Stack.Screen
                name="DiaryEntry"
                component={DiaryEntryScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </View>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
});
