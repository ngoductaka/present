import React, { useState } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MoodAnalytics } from '../components/MoodAnalytics';

export const AnalyticsScreen = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const headerHeight = useHeaderHeight();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={[styles.content, { paddingTop: headerHeight + 10 }]}>
                <MoodAnalytics refreshTrigger={refreshKey} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 10,
    },
});
