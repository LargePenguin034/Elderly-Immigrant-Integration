import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, TextInput, Text, View, SafeAreaView, Alert } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handlePress = () => {
    if (recording) {
      console.log("Calling stopStreaming")
      audioUtils.stopStreaming(recording);
      setRecording(null);
    } else {
      console.log("Calling startStreaming")
      audioUtils.startStreaming(setRecording, setInputSpeech, setTranslation);
      setRecording(true); // Assume streaming is now active
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
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.log("Error setting audio mode:", error);
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
          onDone: () => {
            if (isInput) setIsSpeakingInput(false);
            else setIsSpeakingTranslation(false);
          },
          onError: (error) => {
            console.error("Speech.speak error:", error);
            Alert.alert("Error", "An error occurred while speaking the text");
            setIsSpeakingInput(false);
            setIsSpeakingTranslation(false);
          },
        };

        await Speech.speak(text, options);
      }
    } catch (error) {
      console.error("speakText error:", error);
      Alert.alert("Error", "An unexpected error occurred while trying to speak.");
      setIsSpeakingInput(false);
      setIsSpeakingTranslation(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('settings')}>
          <Ionicons name="settings-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>Translatify</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

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


        {/* Font Size Controls */}
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

        {/* Output Text Area */}
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

      {/* Microphone Button */}
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
});