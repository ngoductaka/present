import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { uploadAudioFile, type UploadResponse } from '../services/audioUploadService';

type VisualState = 'idle' | 'recording' | 'uploading' | 'success' | 'error';

const STATE_INDEX: Record<VisualState, number> = {
  idle: 0,
  recording: 1,
  uploading: 2,
  success: 3,
  error: 4,
};

const setRecordingAudioMode = async () => {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
};

const setPlaybackAudioMode = async () => {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });
};

const formatDuration = (durationMillis: number) => {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const formatResponse = (response: UploadResponse | null) => {
  if (response == null || response === '') {
    return 'Uploaded';
  }

  if (typeof response === 'string') {
    return response;
  }

  if (typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }

  if (typeof response.status === 'string' && response.status.trim()) {
    return response.status;
  }

  const compact = JSON.stringify(response);

  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
};

export function RecordingScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [recordingUri, setRecordingUri] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState<UploadResponse | null>(null);
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null, {
    updateInterval: 200,
  });
  const playerStatus = useAudioPlayerStatus(player);

  const visualState: VisualState = recorderState.isRecording
    ? 'recording'
    : error
      ? 'error'
      : isUploading
        ? 'uploading'
        : response !== null
          ? 'success'
          : 'idle';

  const colorAnim = React.useRef(new Animated.Value(STATE_INDEX.idle)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    setPlaybackAudioMode().catch(() => {
      setError('Audio unavailable');
    });

    return () => {
      setPlaybackAudioMode().catch(() => undefined);
    };
  }, []);

  React.useEffect(() => {
    if (!recordingUri) {
      return;
    }

    player.pause();
    void player.seekTo(0).catch(() => undefined);
  }, [player, recordingUri]);

  React.useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: STATE_INDEX[visualState],
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [colorAnim, visualState]);

  React.useEffect(() => {
    if (visualState !== 'recording') {
      pulseAnim.stopAnimation();
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim, visualState]);

  const buttonColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['#9ca3af', '#ef4444', '#f59e0b', '#10b981', '#dc2626'],
  });

  const haloOpacity = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0.1, 0.22, 0.2, 0.18, 0.18],
  });

  const uploadRecording = async (fileUri: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setResponse(null);

    try {
      const uploadResponse = await uploadAudioFile(fileUri, {
        onProgress: progress => {
          setUploadProgress(progress);
        },
      });

      setResponse(uploadResponse);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const ensurePermission = async () => {
    const currentPermission = await getRecordingPermissionsAsync();

    if (currentPermission.granted) {
      return true;
    }

    const requestedPermission = await requestRecordingPermissionsAsync();

    if (!requestedPermission.granted) {
      setError('Microphone permission is required.');

      if (!requestedPermission.canAskAgain) {
        Alert.alert(
          'Microphone Permission Needed',
          'Enable microphone access in system settings to record audio.',
        );
      }
    }

    return requestedPermission.granted;
  };

  const handleStartRecording = async () => {
    if (recorderState.isRecording || isUploading) {
      return;
    }

    setError(null);
    setResponse(null);
    setUploadProgress(0);
    setRecordingUri(null);
    player.pause();

    try {
      const hasPermission = await ensurePermission();

      if (!hasPermission) {
        return;
      }

      await setRecordingAudioMode();
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (recordingError) {
      const message =
        recordingError instanceof Error ? recordingError.message : 'Unable to start recording.';
      setError(message);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderState.isRecording) {
      return;
    }

    setError(null);

    try {
      await recorder.stop();
      await setPlaybackAudioMode();

      const { url } = await recorder.getStatus();
      const savedUri = url ?? recorder.uri ?? recorderState.url;

      if (!savedUri) {
        throw new Error('Recording file not found.');
      }

      setRecordingUri(savedUri);
    } catch (recordingError) {
      const message =
        recordingError instanceof Error ? recordingError.message : 'Unable to stop recording.';
      setError(message);
    }
  };

  const handleMainButtonPress = async () => {
    if (recorderState.isRecording) {
      await handleStopRecording();
      return;
    }

    await handleStartRecording();
  };

  const handlePlaybackToggle = async () => {
    if (!recordingUri || recorderState.isRecording) {
      return;
    }

    setError(null);

    try {
      await setPlaybackAudioMode();

      if (playerStatus.didJustFinish || playerStatus.currentTime >= playerStatus.duration) {
        await player.seekTo(0);
      }

      if (playerStatus.playing) {
        player.pause();
        return;
      }

      player.play();
    } catch (playbackError) {
      const message =
        playbackError instanceof Error ? playbackError.message : 'Unable to play recording.';
      setError(message);
    }
  };

  const handleManualUpload = async () => {
    if (!recordingUri || recorderState.isRecording || isUploading) {
      return;
    }

    player.pause();
    await setPlaybackAudioMode();
    await uploadRecording(recordingUri);
  };

  const statusText = recorderState.isRecording
    ? formatDuration(recorderState.durationMillis)
    : isUploading
      ? `Uploading ${Math.max(1, Math.round(uploadProgress * 100))}%`
      : playerStatus.playing
        ? `Playing ${formatDuration(playerStatus.currentTime * 1000)}`
        : response !== null
          ? 'Uploaded'
          : error
            ? 'Upload failed'
            : recordingUri
              ? 'Ready to play'
              : 'Tap to record';

  const helperText = error
    ? error
    : response !== null
      ? formatResponse(response)
      : recordingUri
        ? playerStatus.duration > 0
          ? `Length ${formatDuration(playerStatus.duration * 1000)}`
          : 'Ready to upload'
        : 'One tap to start, one tap to stop';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.status}>{statusText}</Text>

          <View style={styles.buttonStage}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.haloScale,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.halo,
                  {
                    backgroundColor: buttonColor,
                    opacity: haloOpacity,
                  },
                ]}
              />
            </Animated.View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={recorderState.isRecording ? 'Stop recording' : 'Start recording'}
              disabled={isUploading}
              onPress={handleMainButtonPress}
              style={styles.centerButtonHitArea}
            >
              <Animated.View
                style={[
                  styles.recordButtonScale,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.recordButton,
                    {
                      backgroundColor: buttonColor,
                    },
                  ]}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#ffffff" size="large" />
                  ) : (
                    <Text style={styles.buttonLabel}>
                      {recorderState.isRecording ? 'Stop' : 'Record'}
                    </Text>
                  )}
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>

          <Text style={styles.helper}>{helperText}</Text>

          {recordingUri ? (
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handlePlaybackToggle}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {playerStatus.playing ? 'Pause' : 'Play'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isUploading}
                onPress={handleManualUpload}
                style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
              >
                <Text style={styles.uploadButtonText}>Upload</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.playButtonPlaceholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    minHeight: 26,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonStage: {
    marginTop: 28,
    marginBottom: 24,
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  haloScale: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonHitArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonScale: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 10,
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  helper: {
    minHeight: 40,
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    minWidth: 112,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  uploadButton: {
    minWidth: 112,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  playButtonPlaceholder: {
    height: 68,
  },
});
