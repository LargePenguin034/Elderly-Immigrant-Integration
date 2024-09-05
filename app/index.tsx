import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, TextInput, Text, View, SafeAreaView, Alert } from "react-native";
import { Audio } from "expo-av";
import * as Speech from 'expo-speech';
import * as FileSystem from "expo-file-system";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import audioUtils from '@/components/audioUtils.js';


export default function App() {
  const [recording, setRecording] = React.useState();
  const [inputSpeech, setInputSpeech] = React.useState("");
  const [translation, setTranslation] = React.useState("");
  const [fontSize, setFontSize] = React.useState(18);
  const [isSpeakingInput, setIsSpeakingInput] = React.useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = React.useState(false);

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
      return newSize >= 12 && newSize <= 32 ? newSize : prevSize;
    });
  };

  const speakText = async (text, isInput) => {
    try {
      // Stop any ongoing speech
      await Speech.stop();
      
      if (isInput) {
        setIsSpeakingInput(false);
        setIsSpeakingTranslation(false);
      } else {
        setIsSpeakingTranslation(false);
        setIsSpeakingInput(false);
      }

      if (text) {
        if (isInput) {
          setIsSpeakingInput(true);
        } else {
          setIsSpeakingTranslation(true);
        }
        
        const options = {
          language: isInput ? 'en-US' : 'zh-CN', // Use Chinese for translation
          pitch: 1.0,
          rate: 0.75,
          volume: 1.0, // Slightly slower rate for better clarity
          onDone: () => {
            if (isInput) {
              setIsSpeakingInput(false);
            } else {
              setIsSpeakingTranslation(false);
            }
          },
          onError: (error) => {
            console.error("Speech.speak error:", error);
            if (isInput) {
              setIsSpeakingInput(false);
            } else {
              setIsSpeakingTranslation(false);
            }
            Alert.alert("Error", "An error occurred while speaking the text");
          },
        };

        await Speech.speak(text, options);
      }
    } catch (error) {
      console.error("speakText error:", error);
      if (isInput) {
        setIsSpeakingInput(false);
      } else {
        setIsSpeakingTranslation(false);
      }
      Alert.alert("Error", "An unexpected error occurred while trying to speak.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translatify</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

       {/* Input Text Area */}
      <View style={styles.translationContainer}>
        <View style={styles.textContainer}>
          <TextInput
            style={[styles.textArea, { fontSize }]}
            value={inputSpeech}
            editable={false}
            onChangeText={(newinputSpeech) => setInputSpeech(newinputSpeech)}
            placeholder="Enter text to translate"
            multiline
          />
          <TouchableOpacity style={styles.speakerButton} onPress={() => speakText(inputSpeech, true)}>
            <Ionicons 
              name={isSpeakingInput ? "volume-high" : "volume-medium"} 
              size={24} 
              color={isSpeakingInput ? "#007bff" : "gray"} 
            />
          </TouchableOpacity>
        </View>

        {/* Font Size Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustFontSize(-2)}>
            <Ionicons name="remove" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.fontSizeDisplay}>
            <Text style={styles.fontSizeText}>{fontSize}</Text>
          </View>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustFontSize(2)}>
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
          <Icon name="stop" size={30} color="#fff" />
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
