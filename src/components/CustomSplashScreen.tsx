import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Animated, Dimensions, Text, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
    onFinish: () => void;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
    const { t } = useLanguage();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.95));
    const [textFadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 1200,
                delay: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto finish after 3 seconds
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1.5 * 1000,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2.5 * 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container,
        {
            // opacity: fadeAnim

        }]}>
            {/* Background Image */}
            <Image
                source={require('../../assets/splash_background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Content Overlay */}
            <View style={styles.overlay}>
                <Animated.View style={[styles.contentContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', justifyContent: 'center', paddingTop: 200 }}>
                        <Text style={styles.titleText}>{t('splash.title')}</Text>
                        <Text style={styles.subtitleText}>{t('splash.subtitle')}</Text>
                    </Animated.View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 9999,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    gifStyle: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    titleText: {
        fontSize: 48,
        fontWeight: '300',
        color: '#FFFFFF',
        letterSpacing: 8,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    subtitleText: {
        fontSize: 16,
        color: 'rgba(252, 247, 247, 0.7)',
        letterSpacing: 2,
        marginTop: 10,
        fontWeight: '400',
        textAlign: 'center',
    },
});
