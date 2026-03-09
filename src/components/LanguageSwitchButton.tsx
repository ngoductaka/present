import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitchButtonProps {
  floating?: boolean;
}

export const LanguageSwitchButton: React.FC<LanguageSwitchButtonProps> = ({ floating = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.container, !floating && styles.containerInline]}>
      <TouchableOpacity
        style={[styles.button, language === 'en' && styles.buttonActive]}
        onPress={() => setLanguage('en')}
      >
        <Text style={[styles.text, language === 'en' && styles.textActive]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, language === 'vi' && styles.buttonActive]}
        onPress={() => setLanguage('vi')}
      >
        <Text style={[styles.text, language === 'vi' && styles.textActive]}>VI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  containerInline: {
    alignSelf: 'flex-start',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  textActive: {
    color: '#fff',
  },
});
