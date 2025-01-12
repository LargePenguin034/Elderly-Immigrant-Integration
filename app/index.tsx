import React, { useState, useEffect } from "react";
import {
  StatusBar,
  TouchableOpacity,
  TextInput,
  Text,
  View,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import audioUtils from '@/components/audioUtils.js';  // Utility functions for audio processing and translation
import { useAppContext } from './_layout';  // Import context to access theme and font size settings
import SplashScreen from './SplashScreen';  // Custom splash screen component
import styles from './styles';  // Importing styles from the stylesheet

// HomeScreen component
export default function HomeScreen() {
  // States for managing recording, speech input, translation, language, etc.
  const [recording, setRecording] = useState(false);
  const [inputSpeech, setInputSpeech] = useState("");  // State for storing input speech text
  const [translation, setTranslation] = useState("");  // State for storing translated text
  const [language, setLanguage] = useState("en");  // Current language (English or Chinese)
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);  // State for tracking input speech playback
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);  // State for tracking translation speech playback
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);  // State to show/hide tutorial modal
  const [scaleValue] = useState(new Animated.Value(0));  // Animated value for tutorial scaling effect
  const [isLoading, setIsLoading] = useState(true);  // State for managing loading state (e.g., SplashScreen)
  const [arrowDirection, setArrowDirection] = useState("→");  // State for managing the direction of the language switch arrow
  const router = useRouter();  // Hook to navigate between app screens
  const { isDarkMode, fontSize } = useAppContext();  // Access theme and font size from context

  // Function to get placeholder text based on the current language
  const getPlaceholderText = () => {
    return language === "en" 
      ? { input: "Hello", output: "你好" }
      : { input: "你好", output: "Hello" };
  };

  // Set the status bar style based on dark mode preference
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content", true);
  }, [isDarkMode]);

  //useEffect(() => {
    //const translateText = async () => {
      //if (inputSpeech) {
        //console.log("Translating:", inputSpeech);
        //const translatedText = await audioUtils.translateText(inputSpeech, language);
        //console.log("Translation result:", translatedText);
        //setTranslation(translatedText);
      //}
    //};
//
    //translateText();
  //}, [inputSpeech, language]);

  // Toggle the language between English and Chinese
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === "en" ? "zh" : "en");  // Switch language
    setArrowDirection(prevArrow => prevArrow === "→" ? "←" : "→");  // Update arrow direction
    setInputSpeech("");  // Clear input speech when language is toggled
    setTranslation("");  // Clear translation when language is toggled
  };

  // Handle press event for recording start/stop
  const handlePress = () => {
    if (recording) {
      console.log("Calling stopStreaming");
      setRecording(false);
      audioUtils.stopStreaming();

    } else {
      console.log("Calling startStreaming");
      audioUtils.startStreaming(
        setRecording,
        (text) => {
          console.log("Received input:", text);
          setInputSpeech(text);  // Update input speech with recorded text
        },
        (translatedText) => {
          console.log("Received translation:", translatedText);
          setTranslation(translatedText);  // Update translation with translated text
        },
        language  // Pass the current language for streaming
      );
      //setRecording(true);
    }
  };

  // Set audio mode configuration for different platforms (iOS/Android)
  const setAudioMode = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,  // Allow playback in silent mode (iOS)
          staysActiveInBackground: true,  // Keep app active when in background
        });
      } else {
        await Audio.setAudioModeAsync({
          shouldDuckAndroid: true,  // Duck audio on Android
          staysActiveInBackground: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,  // Prevent interruptions on Android
          playThroughEarpieceAndroid: false
        });
      }
      console.log("Audio mode set successfully");
    } catch (error) {
      console.error("Error setting audio mode:", error);  // Log any errors when setting audio mode
    }
  };

  // Function to speak a given text (either input or translation)
  const speakText = async (text, isInput) => {
    try {
      await Speech.stop();  // Stop any ongoing speech
      await setAudioMode();  // Set audio mode

      if (text) {
        const options = {
          language: isInput ? (language === "en" ? 'en-US' : 'zh-CN') : (language === "en" ? 'zh-CN' : 'en-US'),  // Choose appropriate language
          pitch: 1.0,
          rate: 0.75,
          volume: 1.0,
        };

        // Use specific voices for iOS devices
        if (Platform.OS === 'ios') {
          options.voice = language === "en" ? 'com.apple.ttsbundle.Samantha-compact' : 'com.apple.ttsbundle.Ting-Ting-compact';
        }

        await Speech.speak(text, options);  // Speak the text
      }
    } catch (error) {
      console.error("speakText error:", error);  // Handle errors during speech
      Alert.alert("Error", "An unexpected error occurred while trying to speak.");
    } finally {
      if (isInput) setIsSpeakingInput(false);  // Reset speaking input state
      else setIsSpeakingTranslation(false);  // Reset speaking translation state
    }
  };

  // Show the tutorial modal with animation
  const showTutorial = () => {
    setIsTutorialVisible(true);  // Show tutorial modal
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();  // Animate tutorial modal scaling
  };

  // Hide the tutorial modal with animation
  const hideTutorial = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsTutorialVisible(false));  // Hide tutorial modal after animation
  };

  // If app is still loading, show the splash screen
  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;  // Finish loading once splash screen is complete
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" }]}>
      {/* Set the status bar based on dark mode */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header with settings and tutorial buttons */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('settings')}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>Translatify</Text>
        <TouchableOpacity style={styles.headerButton} onPress={showTutorial}>
          <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      {/* Translation container for input and output text */}
      <View style={styles.translationContainer}>
        <View style={[styles.textContainer, { backgroundColor: isDarkMode ? 'white' : 'white' }]}>
          <TextInput
            style={[styles.textArea, { fontSize, color: isDarkMode ? 'black' : 'black' }]}
            value={inputSpeech}
            editable={false}
            placeholder={getPlaceholderText().input}
            placeholderTextColor={isDarkMode ? '#666' : '#666'}
            multiline
          />
          <TouchableOpacity style={styles.speakerButton} onPress={() => speakText(inputSpeech, true)}>
            <Ionicons
              name={isSpeakingInput ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeakingInput ? "#007bff" : isDarkMode ? "black" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* Controls for language switcher */}
        <View style={styles.controls}>
          <View style={styles.languageSwitcherContainer}>
            <View style={[styles.languageToggle, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F0F0F0' }]}>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={[styles.languageButton, language === "en" && { backgroundColor: isDarkMode ? '#007AFF' : '#0A84FF' }]}
              >
                <Text style={[styles.languageButtonText, { color: language === "en" ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000') }]}>
                  English
                </Text>
              </TouchableOpacity>
              
              <View style={styles.arrowContainer}>
                <Text style={[styles.arrow, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{arrowDirection}</Text>
              </View>
              
              <TouchableOpacity
                onPress={toggleLanguage}
                style={[styles.languageButton, language === "zh" && { backgroundColor: isDarkMode ? '#007AFF' : '#0A84FF' }]}
              >
                <Text style={[styles.languageButtonText, { color: language === "zh" ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000') }]}>
                  中文
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Output text and speaker button for translation */}
        <View style={styles.textContainer}>
          <TextInput
            style={[styles.textArea, { fontSize, color: isDarkMode ? 'black' : 'black' }]}
            value={translation}
            editable={false}
            placeholder={getPlaceholderText().output}
            placeholderTextColor={isDarkMode ? '#666' : '#666'}
            multiline
          />
          <TouchableOpacity style={styles.speakerButton} onPress={() => speakText(translation, false)}>
            <Ionicons
              name={isSpeakingTranslation ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeakingTranslation ? "#007bff" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Button to start or stop recording */}
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        {recording ? (
          <Ionicons name="stop" size={30} color="#fff" />
        ) : (
          <Ionicons name="mic-outline" size={30} color="white" />
        )}
      </TouchableOpacity>
      
      {/* Tutorial modal */}
      <Modal
        transparent={true}
        visible={isTutorialVisible}
        animationType="fade"
        onRequestClose={hideTutorial}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={hideTutorial}>
          <TouchableOpacity activeOpacity={1} style={styles.centeredView}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleValue }] }]}>
              <Text style={styles.modalTitle}>App Tutorial</Text>
              <ScrollView>
                <Text style={styles.tutorialText}>
                  1. To start recording, press the microphone button. The app will record your speech.
                </Text>
                <Text style={styles.tutorialText}>
                  2. After recording, the app will transcribe your speech into text and display it.
                </Text>
                <Text style={styles.tutorialText}>
                  3. Use the language toggle to switch between English and Chinese.
                </Text>
                <Text style={styles.tutorialText}>
                  4. To hear the input speech or translated text, press the speaker icons next to the text.
                </Text>
                <Text style={styles.tutorialText}>
                  5. You can change app settings from the settings icon on the top left corner.
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={hideTutorial}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
