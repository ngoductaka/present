import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface IntervalSelectorProps {
    value: 30 | 60;
    onChange: (interval: 30 | 60) => void;
}

export const IntervalSelector: React.FC<IntervalSelectorProps> = ({ value, onChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Notification Interval</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        value === 30 && styles.buttonActive,
                    ]}
                    onPress={() => onChange(30)}
                >
                    <Text style={[
                        styles.buttonText,
                        value === 30 && styles.buttonTextActive,
                    ]}>
                        30 min
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        value === 60 && styles.buttonActive,
                    ]}
                    onPress={() => onChange(60)}
                >
                    <Text style={[
                        styles.buttonText,
                        value === 60 && styles.buttonTextActive,
                    ]}>
                        1 hour
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    buttonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    buttonTextActive: {
        color: '#fff',
    },
});
