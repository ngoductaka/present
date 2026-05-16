import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../context/LanguageContext';

type AppLockScreenProps = {
  error?: string | null;
  loading?: boolean;
  onSubmit: (password: string) => void;
};

export const AppLockScreen = ({
  error,
  loading = false,
  onSubmit,
}: AppLockScreenProps) => {
  const { t } = useLanguage();
  const [password, setPassword] = React.useState('');

  const handleSubmit = () => {
    if (!password.trim()) {
      return;
    }

    onSubmit(password);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.lockTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.lockSubtitle')}</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor="#b08a99"
            secureTextEntry
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.unlock')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 248, 251, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5f4453',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
    color: '#8f7380',
  },
  input: {
    borderRadius: 18,
    backgroundColor: '#fff4f8',
    borderWidth: 1,
    borderColor: '#f0d8e3',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#4d3842',
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#b85b83',
  },
  button: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d45c8f',
    marginTop: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
