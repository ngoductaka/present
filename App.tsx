import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RecordingScreen } from './src/screens/RecordingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <RecordingScreen />
    </>
  );
}
