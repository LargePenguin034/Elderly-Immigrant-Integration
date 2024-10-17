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
import audioUtils from '@/components/audioUtils.js';
import { useAppContext } from './_layout';  // Update this line
import SplashScreen from './SplashScreen';
import styles from './styles';

export default function HomeScreen() {
  const [recording, setRecording] = useState();
  const [inputSpeech, setInputSpeech] = useState("");
  const [translation, setTranslation] = useState("");
  const [language, setLanguage] = useState("en");
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [arrowDirection, setArrowDirection] = useState("→");
  const router = useRouter();
  const { isDarkMode, fontSize } = useAppContext();

  const getPlaceholderText = () => {
    return language === "en" 
      ? { input: "Hello", output: "你好" }
      : { input: "你好", output: "Hello" };
  };

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

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === "en" ? "zh" : "en");
    setArrowDirection(prevArrow => prevArrow === "→" ? "←" : "→");
    setInputSpeech("");
    setTranslation("");
  };

  const handlePress = () => {
    if (recording) {
      console.log("Calling stopStreaming");
      audioUtils.stopStreaming();
      //setRecording(null);
    } else {
      console.log("Calling startStreaming");
      audioUtils.startStreaming(
        setRecording,
        (text) => {
          console.log("Received input:", text);
          setInputSpeech(text);
        },
        (translatedText) => {
            console.log("Received translation:", translatedText);
            setTranslation(translatedText);
        },
        language
      );
      //setRecording(true);
    }
  };

  const setAudioMode = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      } else {
        await Audio.setAudioModeAsync({
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false
        });
      }
      console.log("Audio mode set successfully");
    } catch (error) {
      console.error("Error setting audio mode:", error);
    }
  };

  const speakText = async (text, isInput) => {
    try {
      await Speech.stop();
      await setAudioMode();

      if (text) {
        const options = {
          language: isInput ? (language === "en" ? 'en-US' : 'zh-CN') : (language === "en" ? 'zh-CN' : 'en-US'),
          pitch: 1.0,
          rate: 0.75,
          volume: 1.0,
        };

        if (Platform.OS === 'ios') {
          options.voice = language === "en" ? 'com.apple.ttsbundle.Samantha-compact' : 'com.apple.ttsbundle.Ting-Ting-compact';
        }

        await Speech.speak(text, options);
      }
    } catch (error) {
      console.error("speakText error:", error);
      Alert.alert("Error", "An unexpected error occurred while trying to speak.");
    } finally {
      if (isInput) setIsSpeakingInput(false);
      else setIsSpeakingTranslation(false);
    }
  };

  const showTutorial = () => {
    setIsTutorialVisible(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const hideTutorial = () => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsTutorialVisible(false));
  };

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('settings')}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>Translatify</Text>
        <TouchableOpacity style={styles.headerButton} onPress={showTutorial}>
          <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      <View style={styles.translationContainer}>
        <View style={[styles.textContainer, { backgroundColor: isDarkMode ? 'white' : 'white' }]}>
          <TextInput
            style={[styles.textArea, { fontSize, color: isDarkMode ? 'black' : 'black' }]}
            value={inputSpeech}
            onChangeText={(text) => {
              console.log("Input changed:", text);
              setInputSpeech(text);
            }}
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

        <View style={styles.controls}>
        <View style={styles.languageSwitcherContainer}>
          <View style={[
            styles.languageToggle, 
            { backgroundColor: isDarkMode ? '#1A1A1A' : '#F0F0F0' }
          ]}>
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[
                styles.languageButton,
                language === "en" && { backgroundColor: isDarkMode ? '#007AFF' : '#0A84FF' }
              ]}
            >
              <Text style={[
                styles.languageButtonText,
                { color: language === "en" ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000') }
              ]}>
                English
              </Text>
            </TouchableOpacity>
            
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{arrowDirection}</Text>
            </View>
            
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[
                styles.languageButton,
                language === "zh" && { backgroundColor: isDarkMode ? '#007AFF' : '#0A84FF' }
              ]}
            >
              <Text style={[
                styles.languageButtonText,
                { color: language === "zh" ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000') }
              ]}>
                中文
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        {recording ? (
          <Ionicons name="stop" size={30} color="#fff" />
        ) : (
          <Ionicons name="mic-outline" size={30} color="white" />
        )}
      </TouchableOpacity>
      
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