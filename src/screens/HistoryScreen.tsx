import React, { useState } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MoodHistory } from '../components/MoodHistory';

export const HistoryScreen = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const headerHeight = useHeaderHeight();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={[styles.content, { paddingTop: headerHeight + 10 }]}>
                <MoodHistory refreshTrigger={refreshKey} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 10,
    },
});
