import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LogMoodScreen } from './src/screens/LogMoodScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

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
        <SafeAreaView style={{ flex: 1, position: 'relative' }}>
          {showSplashScreen ? (
            <CustomSplashScreen onFinish={handleSplashScreenFinish} />
          ) : (
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: '#007AFF',
                  tabBarInactiveTintColor: '#8E8E93',
                  tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5EA',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 10,
                  },
                  tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4,
                  },
                  headerStyle: {
                    backgroundColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                    height: 70,
                  },
                  headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#1a1a1a',
                  },
                  headerTintColor: '#007AFF',
                }}
              >
                <Tab.Screen
                  name={t('tab.logMood')}
                  component={LogMoodScreen}
                  options={{
                    tabBarIcon: ({ color, size, focused }) => (
                      <Ionicons name={focused ? "happy" : "happy-outline"} size={size} color={color} />
                    ),
                    headerTitle: t('header.logMood'),
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name={t('tab.history')}
                  component={HistoryScreen}
                  options={{
                    tabBarIcon: ({ color, size, focused }) => (
                      <Ionicons name={focused ? "journal" : "journal-outline"} size={size} color={color} />
                    ),
                    headerTitle: t('header.history'),
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name={t('tab.analytics')}
                  component={AnalyticsScreen}
                  options={{
                    tabBarIcon: ({ color, size, focused }) => (
                      <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={size} color={color} />
                    ),
                    headerTitle: t('header.analytics'),
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name={t('tab.reminders')}
                  component={NotificationsScreen}
                  options={{
                    tabBarIcon: ({ color, size, focused }) => (
                      <Ionicons name={focused ? "notifications" : "notifications-outline"} size={size} color={color} />
                    ),
                    headerTitle: t('header.reminders'),
                    headerShown: false,
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>)
          }
          <View style={{ position: 'absolute', bottom: 0, width: 500, height: 20, backgroundColor: 'red' }}>
          </View>
        </SafeAreaView>
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
