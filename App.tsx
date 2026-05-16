import React from 'react';
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
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from './src/navigation/types';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { t } = useLanguage();
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);

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

  const handleSplashScreenFinish = () => {
    setShowSplashScreen(false);
  };

  if (!appIsReady) {
    return null;
  }

  return (

    <LinearGradient
      colors={['#FAEBB6', '#DDE5B6', '#AFD9C9', '#C8E3E8', '#D7E8F0']}
      style={{ flex: 1 }}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaProvider>
        {/* <SafeAreaView style={{ flex: 1, position: 'relative' }}> */}
          {showSplashScreen ? (
            <CustomSplashScreen onFinish={handleSplashScreenFinish} />
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
            </NavigationContainer>)
          }
          {/* <View style={{ position: 'absolute', bottom: 0, width: 500, height: 20, backgroundColor: 'red' }}>
          </View> */}
        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </LinearGradient>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
