import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
    label: string;
    value: string; // HH:mm format
    onChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(() => {
        const [hours, minutes] = value.split(':').map(Number);
        const d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        return d;
    });

    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }

        if (selectedDate) {
            setDate(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            onChange(`${hours}:${minutes}`);
        }
    };

    const showTimePicker = () => {
        setShow(true);
    };

    const hideTimePicker = () => {
        setShow(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
                <Text style={styles.timeText}>{value}</Text>
            </TouchableOpacity>

            {show && (
                <View>
                    <DateTimePicker
                        value={date}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleChange}
                    />
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity style={styles.doneButton} onPress={hideTimePicker}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
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
    timeButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    timeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    doneButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
