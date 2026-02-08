import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QuickMoodLogger } from '../components/QuickMoodLogger';

export const LogMoodScreen = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleMoodSaved = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <View style={styles.content}>
            <StatusBar style="dark" />
            <QuickMoodLogger onSaved={handleMoodSaved} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
});
