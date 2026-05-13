import React from 'react';
import {
  Alert,
  FlatList,
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

type RecordingItem = {
  id: string;
  uri: string;
  title: string;
  createdAt: number;
  durationMillis: number;
  uploadProgress: number;
  uploadResponse: UploadResponse | null;
  uploadError: string | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
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

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);

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

  return compact.length > 100 ? `${compact.slice(0, 97)}...` : compact;
};

const getStatusTone = (item: RecordingItem) => {
  switch (item.uploadStatus) {
    case 'success':
      return styles.statusToneSuccess;
    case 'uploading':
      return styles.statusToneUploading;
    case 'error':
      return styles.statusToneError;
    default:
      return styles.statusToneIdle;
  }
};

export function RecordingScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [recordings, setRecordings] = React.useState<RecordingItem[]>([]);
  const [activeRecordingId, setActiveRecordingId] = React.useState<string | null>(null);
  const [screenError, setScreenError] = React.useState<string | null>(null);
  const [playbackSource, setPlaybackSource] = React.useState<{ uri: string } | null>(null);
  const player = useAudioPlayer(playbackSource, {
    updateInterval: 200,
  });
  const playerStatus = useAudioPlayerStatus(player);

  React.useEffect(() => {
    setPlaybackAudioMode().catch(() => {
      setScreenError('Audio unavailable');
    });

    return () => {
      setPlaybackAudioMode().catch(() => undefined);
    };
  }, []);

  React.useEffect(() => {
    if (!playbackSource) {
      return;
    }

    player.pause();
    void player.seekTo(0).catch(() => undefined);
  }, [player, playbackSource]);

  const updateRecording = React.useCallback(
    (id: string, updater: (item: RecordingItem) => RecordingItem) => {
      setRecordings(current =>
        current.map(item => {
          if (item.id !== id) {
            return item;
          }

          return updater(item);
        }),
      );
    },
    [],
  );

  const ensurePermission = async () => {
    const currentPermission = await getRecordingPermissionsAsync();

    if (currentPermission.granted) {
      return true;
    }

    const requestedPermission = await requestRecordingPermissionsAsync();

    if (!requestedPermission.granted) {
      setScreenError('Microphone permission is required.');

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
    if (recorderState.isRecording) {
      return;
    }

    setScreenError(null);
    setActiveRecordingId(null);
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
      setScreenError(message);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderState.isRecording) {
      return;
    }

    setScreenError(null);

    try {
      await recorder.stop();
      await setPlaybackAudioMode();

      const { url } = await recorder.getStatus();
      const savedUri = url ?? recorder.uri ?? recorderState.url;

      if (!savedUri) {
        throw new Error('Recording file not found.');
      }

      const createdAt = Date.now();
      const item: RecordingItem = {
        id: `${createdAt}`,
        uri: savedUri,
        title: `Recording ${recordings.length + 1}`,
        createdAt,
        durationMillis: recorderState.durationMillis,
        uploadProgress: 0,
        uploadResponse: null,
        uploadError: null,
        uploadStatus: 'idle',
      };

      setRecordings(current => [item, ...current]);
    } catch (recordingError) {
      const message =
        recordingError instanceof Error ? recordingError.message : 'Unable to stop recording.';
      setScreenError(message);
    }
  };

  const handleRecordPress = async () => {
    if (recorderState.isRecording) {
      await handleStopRecording();
      return;
    }

    await handleStartRecording();
  };

  const handlePlaybackToggle = async (item: RecordingItem) => {
    if (recorderState.isRecording) {
      return;
    }

    setScreenError(null);

    try {
      await setPlaybackAudioMode();

      const isSameItem = activeRecordingId === item.id;

      if (!isSameItem) {
        setActiveRecordingId(item.id);
        setPlaybackSource({ uri: item.uri });
        return;
      }

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
      setScreenError(message);
    }
  };

  React.useEffect(() => {
    if (!activeRecordingId || !playbackSource) {
      return;
    }

    if (playerStatus.isLoaded && !playerStatus.playing && playerStatus.currentTime === 0) {
      player.play();
    }
  }, [activeRecordingId, playbackSource, player, playerStatus.currentTime, playerStatus.isLoaded, playerStatus.playing]);

  const handleUpload = async (item: RecordingItem) => {
    if (item.uploadStatus === 'uploading' || recorderState.isRecording) {
      return;
    }

    if (activeRecordingId === item.id && playerStatus.playing) {
      player.pause();
    }

    await setPlaybackAudioMode();

    updateRecording(item.id, current => ({
      ...current,
      uploadStatus: 'uploading',
      uploadProgress: 0,
      uploadError: null,
      uploadResponse: null,
    }));

    try {
      const uploadResponse = await uploadAudioFile(item.uri, {
        onProgress: progress => {
          updateRecording(item.id, current => ({
            ...current,
            uploadStatus: 'uploading',
            uploadProgress: progress,
          }));
        },
      });

      updateRecording(item.id, current => ({
        ...current,
        uploadStatus: 'success',
        uploadProgress: 1,
        uploadResponse: uploadResponse,
        uploadError: null,
      }));
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.';

      updateRecording(item.id, current => ({
        ...current,
        uploadStatus: 'error',
        uploadError: message,
        uploadResponse: null,
      }));
    }
  };

  const headerStatus = recorderState.isRecording
    ? `Recording ${formatDuration(recorderState.durationMillis)}`
    : screenError
      ? screenError
      : recordings.length === 0
        ? 'Tap the red button to record'
        : `${recordings.length} recording${recordings.length > 1 ? 's' : ''}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>All Recordings</Text>
          <Text style={styles.subtitle}>{headerStatus}</Text>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={recordings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isActive = activeRecordingId === item.id;
            const isPlaying = isActive && playerStatus.playing;
            const playbackTime = isActive
              ? Math.min(playerStatus.currentTime * 1000, item.durationMillis)
              : 0;

            return (
              <View style={styles.row}>
                <View style={styles.rowMain}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowDuration}>
                      {isPlaying ? formatDuration(playbackTime) : formatDuration(item.durationMillis)}
                    </Text>
                  </View>

                  <Text style={styles.rowMeta}>{formatDate(item.createdAt)}</Text>

                  <View style={styles.waveTrack}>
                    <View
                      style={[
                        styles.waveProgress,
                        {
                          width:
                            isActive && item.durationMillis > 0
                              ? `${Math.max(6, (playbackTime / item.durationMillis) * 100)}%`
                              : '18%',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.rowFooter}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handlePlaybackToggle(item)}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {isPlaying ? 'Pause' : 'Play'}
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      disabled={item.uploadStatus === 'uploading'}
                      onPress={() => void handleUpload(item)}
                      style={[
                        styles.uploadButton,
                        item.uploadStatus === 'uploading' && styles.uploadButtonDisabled,
                      ]}
                    >
                      <Text style={styles.uploadButtonText}>
                        {item.uploadStatus === 'uploading' ? 'Uploading' : 'Upload'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={[styles.statusPill, getStatusTone(item)]}>
                    <Text style={styles.statusPillText}>
                      {item.uploadStatus === 'success'
                        ? formatResponse(item.uploadResponse)
                        : item.uploadStatus === 'uploading'
                          ? `Uploading ${Math.max(1, Math.round(item.uploadProgress * 100))}%`
                          : item.uploadStatus === 'error'
                            ? item.uploadError ?? 'Upload failed'
                            : 'Ready to upload'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recordings yet</Text>
              <Text style={styles.emptyText}>Tap the record button to create your first memo.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={recorderState.isRecording ? 'Stop recording' : 'Start recording'}
            onPress={handleRecordPress}
            style={styles.recordButtonShell}
          >
            <View style={styles.recordButtonOuter}>
              <View
                style={[
                  styles.recordButtonInner,
                  recorderState.isRecording && styles.recordButtonInnerActive,
                ]}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f5f5f7',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyState: {
    marginTop: 120,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  rowMain: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  rowDuration: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    color: '#111111',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  waveTrack: {
    marginTop: 14,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  waveProgress: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#111111',
  },
  rowFooter: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 40,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#eceef2',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  uploadButton: {
    minHeight: 40,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.55,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusPill: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  statusToneIdle: {
    backgroundColor: '#f3f4f6',
  },
  statusToneUploading: {
    backgroundColor: '#fff7ed',
  },
  statusToneSuccess: {
    backgroundColor: '#ecfdf5',
  },
  statusToneError: {
    backgroundColor: '#fef2f2',
  },
  statusPillText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: 'rgba(245, 245, 247, 0.96)',
  },
  recordButtonShell: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  recordButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ff3b30',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
});
