import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiarySetupModal } from '../components/DiarySetupModal';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import {
  createEmptyDiaryEntry,
  deleteDiaryEntryByDate,
  deleteDiaryImageAsync,
  getDiaryEntryByDate,
  isDiaryEntryEmpty,
  storeDiaryImageAsync,
  upsertDiaryEntry,
} from '../services/diaryService';
import {
  DIARY_BODY_STATE_OPTIONS,
  DIARY_EMOTION_OPTIONS,
  DIARY_WEATHER_OPTIONS,
  DiaryBodyState,
  DiaryEntry,
} from '../types';

type DiaryEntryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DiaryEntry'
>;

const parseDateString = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateTitle = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDateString(date));

const backgroundImage = require('../../assets/bg1.jpg');

export const DiaryEntryScreen = ({
  navigation,
  route,
}: DiaryEntryScreenProps) => {
  const { date } = route.params;
  const { t, locale } = useLanguage();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [draft, setDraft] = React.useState<DiaryEntry>(() =>
    createEmptyDiaryEntry(date),
  );
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showSetupModal, setShowSetupModal] = React.useState(false);
  const [previewImageUri, setPreviewImageUri] = React.useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);
  const hasHydratedRef = React.useRef(false);

  React.useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      try {
        const existingEntry = await getDiaryEntryByDate(date);

        if (!isActive) {
          return;
        }

        const nextDraft = existingEntry ?? createEmptyDiaryEntry(date);
        setDraft(nextDraft);
        setLastSavedAt(existingEntry?.updatedAt ?? null);
        setShowSetupModal(!existingEntry);
      } catch (error) {
        Alert.alert(t('alerts.errorTitle'), t('diary.loadFailed'));
      } finally {
        if (isActive) {
          setLoading(false);
          hasHydratedRef.current = true;
        }
      }
    };

    loadEntry();

    return () => {
      isActive = false;
      hasHydratedRef.current = false;
    };
  }, [date, t]);

  const persistDraft = React.useCallback(async () => {
    if (isDiaryEntryEmpty(draft)) {
      await deleteDiaryEntryByDate(draft.date);
      setLastSavedAt(null);
      return;
    }

    setSaving(true);

    try {
      const savedEntry = await upsertDiaryEntry(draft);
      setLastSavedAt(savedEntry.updatedAt);
    } catch (error) {
      console.error('Failed to save diary entry:', error);
    } finally {
      setSaving(false);
    }
  }, [draft]);

  React.useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const saveTimer = setTimeout(() => {
      void persistDraft();
    }, 700);

    return () => clearTimeout(saveTimer);
  }, [draft, persistDraft]);

  React.useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const updateDraft = React.useCallback((updates: Partial<DiaryEntry>) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...updates,
    }));
  }, []);

  const toggleBodyState = (state: DiaryBodyState) => {
    setDraft((currentDraft) => {
      const hasState = currentDraft.bodyStates.includes(state);

      return {
        ...currentDraft,
        bodyStates: hasState
          ? currentDraft.bodyStates.filter((item) => item !== state)
          : [...currentDraft.bodyStates, state],
      };
    });
  };

  const appendImage = (uri: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      images: [...currentDraft.images, uri],
    }));
  };

  const removeImageFromDraft = (uri: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      images: currentDraft.images.filter((imageUri) => imageUri !== uri),
    }));
  };

  const showPermissionAlert = (titleKey: string, messageKey: string) => {
    Alert.alert(t(titleKey), t(messageKey));
  };

  const handlePermissionFailure = (source: 'library' | 'camera') => {
    showPermissionAlert(
      'alerts.permissionTitle',
      source === 'library'
        ? 'alerts.mediaPermissionMessage'
        : 'alerts.cameraPermissionMessage',
    );
  };

  const getPickerResult = async (source: 'library' | 'camera') => {
    if (source === 'library') {
      return ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    }

    return ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
  };

  const handleImagePick = async (source: 'library' | 'camera') => {
    try {
      if (source === 'library') {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          handlePermissionFailure(source);
          return;
        }
      } else {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          handlePermissionFailure(source);
          return;
        }
      }

      const result = await getPickerResult(source);

      if (result.canceled || !result.assets.length) {
        return;
      }

      const persistedUri = await storeDiaryImageAsync(result.assets[0].uri);
      appendImage(persistedUri);
    } catch (error) {
      Alert.alert(t('alerts.errorTitle'), t('diary.imageSaveFailed'));
    }
  };

  const removeImage = async (uri: string) => {
    await deleteDiaryImageAsync(uri);
    removeImageFromDraft(uri);
  };

  const formattedUpdatedAt = React.useMemo(() => {
    if (!lastSavedAt) {
      return null;
    }

    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(lastSavedAt));
  }, [lastSavedAt, locale]);

  const selectedEmotion = DIARY_EMOTION_OPTIONS.find(
    (option) => option.id === draft.emotion,
  );
  const selectedWeather = DIARY_WEATHER_OPTIONS.find(
    (option) => option.id === draft.weather,
  );

  if (loading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar style='dark' />
          <Text style={styles.loadingText}>{t('diary.loading')}</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style='dark' />
        <DiarySetupModal
          visible={showSetupModal}
          emotion={draft.emotion}
          weather={draft.weather}
          bodyStates={draft.bodyStates}
          onEmotionChange={(emotion) => updateDraft({ emotion })}
          onWeatherChange={(weather) => updateDraft({ weather })}
          onBodyStateToggle={toggleBodyState}
          onClose={() => setShowSetupModal(false)}
          onSkip={() => setShowSetupModal(false)}
        />
        <Modal
          visible={Boolean(previewImageUri)}
          transparent
          animationType='fade'
          onRequestClose={() => setPreviewImageUri(null)}
        >
          <Pressable
            style={styles.previewBackdrop}
            onPress={() => setPreviewImageUri(null)}
          >
            <View style={styles.previewContent}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setPreviewImageUri(null)}
              activeOpacity={0.85}
            >
              <Ionicons name='close' size={22} color='#ffffff' />
            </TouchableOpacity>
            {previewImageUri ? (
              <Image
                source={{ uri: previewImageUri }}
                style={styles.previewImage}
                resizeMode='contain'
              />
            ) : null}
            </View>
          </Pressable>
        </Modal>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.pageHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
              >
                <Ionicons name='chevron-back' size={20} color='#264044' />
              </TouchableOpacity>
              <Text style={styles.pageHeaderTitle}>
                {formatDateTitle(date, locale)}
              </Text>
              <View style={styles.pageHeaderSpacer} />
            </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={[
              styles.content,
              keyboardVisible && styles.contentWithKeyboardToolbar,
            ]}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editorSheet}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTextWrap}>
                  <Text style={styles.saveStatus}>
                    {saving
                      ? t('diary.savingStatus')
                      : formattedUpdatedAt
                        ? t('diary.savedStatus', { time: formattedUpdatedAt })
                        : t('diary.autoSaveHint')}
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => {
                      void handleImagePick('library');
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name='images-outline' size={20} color='#1f6f78' />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => {
                      void handleImagePick('camera');
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name='camera-outline' size={20} color='#1f6f78' />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => setShowSetupModal(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name='create-outline' size={20} color='#1f6f78' />
                  </TouchableOpacity>
                </View>
              </View>

              <Pressable
                style={styles.metaRow}
                onPress={() => setShowSetupModal(true)}
              >
                {selectedEmotion ? (
                  <View style={styles.metaChip}>
                    <Image
                      source={selectedEmotion.image}
                      style={styles.metaChipEmotionImage}
                      resizeMode='contain'
                    />
                    <Text style={styles.metaChipText}>
                      {t(selectedEmotion.labelKey)}
                    </Text>
                  </View>
                ) : null}

                {selectedWeather ? (
                  <View style={styles.metaChip}>
                    <Ionicons
                      name={
                        selectedWeather.icon as React.ComponentProps<
                          typeof Ionicons
                        >['name']
                      }
                      size={16}
                      color='#446368'
                    />
                    <Text style={styles.metaChipText}>
                      {t(selectedWeather.labelKey)}
                    </Text>
                  </View>
                ) : null}

                {draft.bodyStates.map((state) => {
                  const option = DIARY_BODY_STATE_OPTIONS.find(
                    (item) => item.id === state,
                  );

                  if (!option) {
                    return null;
                  }

                  return (
                    <View key={state} style={styles.metaChip}>
                      <Ionicons
                        name={
                          option.icon as React.ComponentProps<
                            typeof Ionicons
                          >['name']
                        }
                        size={16}
                        color='#446368'
                      />
                      <Text style={styles.metaChipText}>
                        {t(option.labelKey)}
                      </Text>
                    </View>
                  );
                })}
              </Pressable>

              {draft.images.length ? (
                <View style={styles.imageGrid}>
                  {draft.images.map((uri) => (
                    <View key={uri} style={styles.imageTile}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setPreviewImageUri(uri)}
                      >
                        <Image source={{ uri }} style={styles.imagePreview} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          void removeImage(uri);
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name='close' size={16} color='#ffffff' />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}

              <TextInput
                style={styles.textInput}
                multiline
                scrollEnabled={false}
                textAlignVertical='top'
                placeholder={t('diary.contentPlaceholder')}
                placeholderTextColor='#8fa3a6'
                value={draft.content}
                onChangeText={(content) => updateDraft({ content })}
              />
            </View>
          </ScrollView>
          {keyboardVisible ? (
            <View style={styles.keyboardToolbar}>
              <TouchableOpacity
                style={styles.keyboardToolButton}
                onPress={() => {
                  void handleImagePick('library');
                }}
                activeOpacity={0.85}
              >
                <Ionicons name='images-outline' size={18} color='#1f6f78' />
                <Text style={styles.keyboardToolText}>
                  {t('diary.addFromLibrary')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.keyboardToolButton}
                onPress={() => {
                  void handleImagePick('camera');
                }}
                activeOpacity={0.85}
              >
                <Ionicons name='camera-outline' size={18} color='#1f6f78' />
                <Text style={styles.keyboardToolText}>
                  {t('diary.takePhoto')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.keyboardToolButton}
                onPress={() => setShowSetupModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name='create-outline' size={18} color='#1f6f78' />
                <Text style={styles.keyboardToolText}>
                  {t('diary.editCheckIn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.keyboardDismissButton}
                onPress={() => Keyboard.dismiss()}
                activeOpacity={0.85}
              >
                <Ionicons name='chevron-down' size={20} color='#264044' />
              </TouchableOpacity>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#4f6368',
  },
  previewBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 18, 20, 0.92)',
    padding: 20,
  },
  previewContent: {
    width: '100%',
    maxWidth: 960,
    maxHeight: '78%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  previewImage: {
    width: '100%',
    height: '78%',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  pageHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#264044',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  pageHeaderSpacer: {
    width: 38,
    height: 38,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 14,
  },
  contentWithKeyboardToolbar: {
    paddingBottom: 108,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTextWrap: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf8f7',
  },
  editorSheet: {
    minHeight: 320,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    padding: 12,
  },
  keyboardToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 101, 106, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  keyboardToolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#edf8f7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  keyboardToolText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f6f78',
  },
  keyboardDismissButton: {
    marginLeft: 'auto',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(38, 64, 68, 0.08)',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#f2f6f5',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  metaChipEmotionImage: {
    width: 30,
    height: 30,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#455b60',
  },
  saveStatus: {
    marginTop: 8,
    fontSize: 13,
    color: '#667a7e',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4c6065',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    minHeight: 360,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#21393d',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  imageTile: {
    position: 'relative',
  },
  imagePreview: {
    width: 104,
    height: 104,
    borderRadius: 18,
    backgroundColor: '#d8e3e1',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 31, 34, 0.72)',
  },
});
