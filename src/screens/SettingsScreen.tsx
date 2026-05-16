import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitchButton } from '../components/LanguageSwitchButton';
import { TimePicker } from '../components/TimePicker';
import { NotificationSettings } from '../types';
import { RootStackParamList } from '../navigation/types';
import { loadSettings, saveSettings } from '../utils/storage';
import { hasPassword, removePassword, savePassword } from '../utils/passwordStorage';
import {
  cancelAllNotifications,
  requestPermissions,
  scheduleNotifications,
} from '../services/notificationService';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [savingNotifications, setSavingNotifications] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [passwordSet, setPasswordSet] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [settings, setSettings] = React.useState<NotificationSettings>({
    time: '08:00',
    isActive: false,
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [savedSettings, storedPassword] = await Promise.all([
          loadSettings(),
          hasPassword(),
        ]);
        setSettings(savedSettings);
        setPasswordSet(storedPassword);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      const nextSettings = {
        ...settings,
        isActive: true,
      };
      const hasPermissionValue = await requestPermissions();

      if (!hasPermissionValue) {
        await saveSettings({
          ...settings,
          isActive: false,
        });
        setSettings((current) => ({
          ...current,
          isActive: false,
        }));
        Alert.alert(t('alerts.permissionTitle'), t('alerts.permissionMessage'));
        return;
      }

      await cancelAllNotifications();
      await scheduleNotifications(nextSettings, {
        title: t('notifications.reminderTitle'),
        body: t('notifications.reminderBody'),
      });

      await saveSettings(nextSettings);
      setSettings(nextSettings);
      Alert.alert(t('alerts.successTitle'), t('alerts.scheduledSuccess'));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.scheduleFailed'));
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSavePassword = async () => {
    if (password.length < 4) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.passwordMismatch'));
      return;
    }

    try {
      setSavingPassword(true);
      await savePassword(password);
      setPasswordSet(true);
      setPassword('');
      setConfirmPassword('');
      Alert.alert(t('alerts.successTitle'), t('settings.passwordSet'));
    } catch (error) {
      console.error('Error saving password:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.saveFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDisablePassword = () => {
    Alert.alert(
      t('settings.disablePasswordTitle'),
      t('settings.disablePasswordMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.disablePassword'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setSavingPassword(true);
                await removePassword();
                setPasswordSet(false);
                setPassword('');
                setConfirmPassword('');
                Alert.alert(t('alerts.successTitle'), t('settings.passwordDisabled'));
              } catch (error) {
                console.error('Error disabling password:', error);
                Alert.alert(t('alerts.errorTitle'), t('alerts.saveFailed'));
              } finally {
                setSavingPassword(false);
              }
            })();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d45c8f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={20} color="#d45c8f" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('header.settings')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="language-outline" size={24} color="#d45c8f" />
            </View>
            <Text style={styles.cardTitle}>{t('settings.languageSection')}</Text>
          </View>
          <LanguageSwitchButton />
        </View>

          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="notifications-outline" size={24} color="#d45c8f" />
            </View>
            <Text style={styles.cardTitle}>{t('settings.notificationsSection')}</Text>
          </View>
          <Text style={styles.cardHint}>{t('settings.notificationsHint')}</Text>
          <TimePicker
            label={t('notifications.time')}
            value={settings.time}
            onChange={(time) => setSettings((current) => ({ ...current, time }))}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => void handleSaveNotifications()}
            activeOpacity={0.85}
            disabled={savingNotifications}
          >
            {savingNotifications ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {t('settings.saveNotifications')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="lock-closed-outline" size={24} color="#d45c8f" />
            </View>
            <Text style={styles.cardTitle}>{t('settings.passwordSection')}</Text>
          </View>
          <Text style={styles.cardHint}>{t('settings.passwordHint')}</Text>
          <Text style={styles.passwordStatus}>
            {passwordSet ? t('settings.passwordSet') : t('settings.passwordNotSet')}
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('settings.passwordPlaceholder')}
            placeholderTextColor="#b08a99"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('settings.passwordConfirmPlaceholder')}
            placeholderTextColor="#b08a99"
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => void handleSavePassword()}
            activeOpacity={0.85}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('settings.savePassword')}</Text>
            )}
          </TouchableOpacity>
          {passwordSet ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDisablePassword}
              activeOpacity={0.85}
              disabled={savingPassword}
            >
              <Text style={styles.secondaryButtonText}>
                {t('settings.disablePassword')}
              </Text>
            </TouchableOpacity>
          ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 231, 238, 0.96)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5f4453',
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 248, 251, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8e7ee',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5f4453',
  },
  cardHint: {
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#8f7380',
  },
  input: {
    borderRadius: 16,
    backgroundColor: '#fff4f8',
    borderWidth: 1,
    borderColor: '#f0d8e3',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#4d3842',
    marginBottom: 12,
  },
  passwordStatus: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#8f7380',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d45c8f',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8e7ee',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b85b83',
  },
});
