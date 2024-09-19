import React, { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
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
import { useTheme } from './_layout';

export default function HomeScreen() {
  const [recording, setRecording] = useState();
  const [inputSpeech, setInputSpeech] = useState("");
  const [translation, setTranslation] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false); // Modal visibility state
  const [scaleValue] = useState(new Animated.Value(0)); // Animation state for modal scale
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handlePress = () => {
    if (recording) {
      audioUtils.stopRecording(recording, setRecording, setInputSpeech, setTranslation);
    } else {
      audioUtils.startRecording(setRecording, setInputSpeech);
    }
  };

  const adjustFontSize = (change) => {
    setFontSize((prevSize) => {
      const newSize = prevSize + change;
      return newSize >= 20 && newSize <= 50 ? newSize : prevSize;
    });
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
          language: isInput ? 'en-US' : 'zh-CN',
          pitch: 1.0,
          rate: 0.75,
          volume: 1.0,
        };

        if (Platform.OS === 'ios') {
          options.voice = 'com.apple.ttsbundle.Ting-Ting-compact';
        }

        console.log("Speaking text:", text);
        console.log("Speech options:", options);

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

  // Modal animation (scale effect)
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('settings')}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>Translatify</Text>
        <TouchableOpacity style={styles.headerButton} onPress={showTutorial}>
          <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      {/* Modal for Tutorial */}
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
                  3. You can adjust the font size of the text using the + and - buttons.
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

      <View style={styles.translationContainer}>
        <View style={[styles.textContainer, { backgroundColor: isDarkMode ? 'white' : 'white' }]}>
          <TextInput
            style={[styles.textArea, { fontSize, color: isDarkMode ? 'black' : 'black' }]}
            value={inputSpeech}
            editable={false}
            onChangeText={setInputSpeech}
            placeholder="Enter text to translate"
            placeholderTextColor={isDarkMode ? '#666' : '#666'}
            multiline
          />
          <TouchableOpacity style={styles.speakerButton} onPress={() => speakText(inputSpeech, true)}>
            <Ionicons
              name={isSpeakingInput ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeakingInput ? "#007bff" : isDarkMode ? "black" : "gray"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustFontSize(-3)}>
            <Ionicons name="remove" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.fontSizeDisplay}>
            <Text style={styles.fontSizeText}>{fontSize}</Text>
          </View>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustFontSize(3)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <TextInput
            style={[styles.textArea, { fontSize }]}
            value={translation}
            editable={false}
            multiline
          />
          <TouchableOpacity style={styles.speakerButton} onPress={() => speakText(translation, false)}>
            <Ionicons
              name={isSpeakingTranslation ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeakingTranslation ? "#007bff" : "gray"}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  translationContainer: {
    padding: 20,
  },
  textContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  speakerButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  fontSizeDisplay: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  fontSizeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tutorialText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
