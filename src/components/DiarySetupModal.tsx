import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import {
  DIARY_BODY_STATE_OPTIONS,
  DIARY_EMOTION_OPTIONS,
  DIARY_WEATHER_OPTIONS,
  DiaryBodyState,
  DiaryEmotion,
  DiaryWeather,
} from '../types';

type DiarySetupModalProps = {
  visible: boolean;
  emotion?: DiaryEmotion;
  weather?: DiaryWeather;
  bodyStates: DiaryBodyState[];
  onEmotionChange: (emotion: DiaryEmotion) => void;
  onWeatherChange: (weather: DiaryWeather) => void;
  onBodyStateToggle: (state: DiaryBodyState) => void;
  onClose: () => void;
  onSkip: () => void;
};

export const DiarySetupModal = ({
  visible,
  emotion,
  weather,
  bodyStates,
  onEmotionChange,
  onWeatherChange,
  onBodyStateToggle,
  onClose,
}: DiarySetupModalProps) => {
  const { t } = useLanguage();
  const primaryEmotionOptions = DIARY_EMOTION_OPTIONS.filter(
    (option) => option.id !== 'khong_ro'
  );
  const fallbackEmotionOption = DIARY_EMOTION_OPTIONS.find(
    (option) => option.id === 'khong_ro'
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('diary.setupTitle')}</Text>
              <Text style={styles.subtitle}>{t('diary.setupSubtitle')}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#3f5056" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('diary.emotionLabel')}</Text>
              <View style={[styles.optionGrid, styles.emotionGrid]}>
                {primaryEmotionOptions.map((option) => {
                  const isSelected = emotion === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        styles.emotionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => onEmotionChange(option.id)}
                    >
                      <View
                        style={[
                          styles.optionIconWrap,
                          isSelected && styles.optionIconWrapSelected,
                        ]}
                      >
                        <Image
                          source={option.image}
                          style={styles.optionImage}
                          resizeMode='contain'
                        />
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {t(option.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {fallbackEmotionOption ? (
                <TouchableOpacity
                  style={[
                    styles.fallbackEmotionCard,
                    emotion === fallbackEmotionOption.id &&
                      styles.fallbackEmotionCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => onEmotionChange(fallbackEmotionOption.id)}
                >
                  <View
                    style={[
                      styles.fallbackEmotionIconWrap,
                      emotion === fallbackEmotionOption.id &&
                        styles.fallbackEmotionIconWrapSelected,
                    ]}
                  >
                    <Image
                      source={fallbackEmotionOption.image}
                      style={styles.fallbackEmotionImage}
                      resizeMode='contain'
                    />
                  </View>
                  <Text
                    style={[
                      styles.fallbackEmotionText,
                      emotion === fallbackEmotionOption.id &&
                        styles.fallbackEmotionTextSelected,
                    ]}
                  >
                    {t(fallbackEmotionOption.labelKey)}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('diary.weatherLabel')}</Text>
              <View style={styles.optionGrid}>
                {DIARY_WEATHER_OPTIONS.map((option) => {
                  const isSelected = weather === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => onWeatherChange(option.id)}
                    >
                      <View
                        style={[
                          styles.optionIconWrap,
                          isSelected && styles.optionIconWrapSelected,
                        ]}
                      >
                        <Ionicons
                          name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                          size={34}
                          color={isSelected ? '#d45c8f' : '#57696f'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {t(option.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('diary.bodyStateLabel')}</Text>
              <View style={styles.optionGrid}>
                {DIARY_BODY_STATE_OPTIONS.map((option) => {
                  const isSelected = bodyStates.includes(option.id);
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      onPress={() => onBodyStateToggle(option.id)}
                    >
                      <View
                        style={[
                          styles.optionIconWrap,
                          isSelected && styles.optionIconWrapSelected,
                        ]}
                      >
                        <Ionicons
                          name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                          size={34}
                          color={isSelected ? '#d45c8f' : '#57696f'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {t(option.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(16, 23, 27, 0.32)',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#f8fbfa',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#20363b',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#5e7478',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6e8ef',
  },
  content: {
    gap: 20,
    paddingBottom: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b4247',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emotionGrid: {
    gap: 2,
  },
  optionCard: {
    width: '18%',
    minHeight: 104,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  emotionCard: {
    width: '19.2%',
    minHeight: 98,
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  fallbackEmotionCard: {
    marginTop: 6,
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
    backgroundColor: '#f8eef3',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fallbackEmotionCardSelected: {
    backgroundColor: '#faf2f6',
  },
  optionCardSelected: {
    backgroundColor: 'transparent',
  },
  optionIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  optionIconWrapSelected: {
    backgroundColor: '#fbeaf1',
  },
  optionImage: {
    width: 50,
    height: 50,
  },
  fallbackEmotionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fallbackEmotionIconWrapSelected: {
    backgroundColor: '#f4dbe6',
  },
  fallbackEmotionImage: {
    width: 34,
    height: 34,
  },
  optionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3f5056',
    textAlign: 'center',
    lineHeight: 12,
  },
  optionTextSelected: {
    color: '#c24f82',
    fontWeight: '700',
  },
  fallbackEmotionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4d6267',
  },
  fallbackEmotionTextSelected: {
    color: '#c24f82',
    fontWeight: '700',
  },
  footer: {
    marginTop: 10,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#d45c8f',
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
