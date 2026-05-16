import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.iconWrap}>
        <Ionicons name="language-outline" size={15} color="#8a5871" />
      </View>
      <TouchableOpacity
        style={[styles.button, language === 'en' && styles.buttonActive]}
        onPress={() => setLanguage('en')}
        activeOpacity={0.85}
      >
        <Text style={[styles.text, language === 'en' && styles.textActive]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, language === 'vi' && styles.buttonActive]}
        onPress={() => setLanguage('vi')}
        activeOpacity={0.85}
      >
        <Text style={[styles.text, language === 'vi' && styles.textActive]}>VI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(252, 244, 248, 0.98)',
    padding: 4,
    gap: 4,
  },
  containerInline: {
    alignSelf: 'flex-start',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 223, 233, 0.96)',
  },
  button: {
    minWidth: 40,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#d45c8f',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a5871',
  },
  textActive: {
    color: '#ffffff',
  },
});
