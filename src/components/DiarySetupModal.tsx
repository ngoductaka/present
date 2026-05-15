import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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
  onSkip,
}: DiarySetupModalProps) => {
  const { t } = useLanguage();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
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
              <View style={styles.optionGrid}>
                {DIARY_EMOTION_OPTIONS.map((option) => {
                  const isSelected = emotion === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => onEmotionChange(option.id)}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={styles.optionText}>{t(option.labelKey)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
                      <Ionicons
                        name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                        size={18}
                        color={isSelected ? '#1f6f78' : '#57696f'}
                      />
                      <Text style={styles.optionText}>{t(option.labelKey)}</Text>
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
                      <Ionicons
                        name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                        size={18}
                        color={isSelected ? '#1f6f78' : '#57696f'}
                      />
                      <Text style={styles.optionText}>{t(option.labelKey)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSkip}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>{t('diary.skipForNow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{t('diary.startWriting')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    backgroundColor: '#e8f0ee',
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
    gap: 10,
  },
  optionCard: {
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe7e5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionCardSelected: {
    borderColor: '#8dc4bb',
    backgroundColor: '#eef8f6',
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3f5056',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#edf2f1',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#51656a',
  },
  primaryButton: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#1f6f78',
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
