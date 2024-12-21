import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// SplashScreen component that displays a logo and app name with animation
const SplashScreen = ({ onFinish }) => {
  // Create animated values for fade and scale effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate the splash screen elements
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up animation with spring effect
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    // Set a timer to fade out the splash screen after 1 second
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(onFinish);
    }, 1000);

    // Clean up the timer on component unmount
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    // Create a gradient background
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#2a2a2a']}
      style={styles.container}
    >
      {/* Animated container for logo and app name */}
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        {/* Logo container with shadow effect */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/translatify-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* App name text */}
        <Text style={styles.appName}>Translatify</Text>
      </Animated.View>
    </LinearGradient>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    // tintColor: '#ffffff', // This will make the logo white. Remove if your logo already has the right colors.
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
});

export default SplashScreen;