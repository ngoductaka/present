import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LogMoodScreen } from './src/screens/LogMoodScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, position: 'relative', backgroundColor: 'red' }}>
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
              name="Log Mood"
              component={LogMoodScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabIcon emoji="✨" color={color} size={size} />
                ),
                headerTitle: '✨ Log Your Mood',
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabIcon emoji="📖" color={color} size={size} />
                ),
                headerTitle: '📖 Mood History',
              }}
            />
            <Tab.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabIcon emoji="📊" color={color} size={size} />
                ),
                headerTitle: '📊 Analytics',
              }}
            />
            <Tab.Screen
              name="Reminders"
              component={NotificationsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabIcon emoji="⏰" color={color} size={size} />
                ),
                headerTitle: '⏰ Reminders',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <View style={{ backgroundColor: 'red', position: 'absolute', bottom: -20, width: 500, height: 20 }}>
          <TabIcon emoji="✨" color="#007AFF" size={24} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Custom tab icon component using emojis
const TabIcon = ({ emoji, color, size }: { emoji: string; color: string; size: number }) => {
  const { Text } = require('react-native');
  return (
    <Text style={{ fontSize: size + 4, opacity: color === '#007AFF' ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
};


