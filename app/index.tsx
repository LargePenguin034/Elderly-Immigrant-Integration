import React from "react";
import { TouchableOpacity, StyleSheet, TextInput, Text, View, Button } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons';
import audioUtils from '@/components/audioUtils.js';

export default function App() {
  const [recording, setRecording] = React.useState();
  const [inputSpeech, setInputSpeech] = React.useState("");
  const [translation, setTranslation] = React.useState("");
  const [response, setResponse] = React.useState(null);

  const handlePress = () => {
    if (recording) {
      audioUtils.stopRecording(recording, setRecording, setInputSpeech, setTranslation);
    } else {
      audioUtils.startRecording(setRecording, setInputSpeech);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        value={inputSpeech}
        editable={false}
        onChangeText={(newinputSpeech) => setInputSpeech(newinputSpeech)}
        placeholder="Start typing..."
        multiline
      />
      <TextInput
        style={styles.textArea}
        value={translation}
        editable={false}
        onChangeText={(newTranslation) => setTranslation(newTranslation)}
        placeholder="Start typing..."
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        {recording ? (
          <Icon name="stop" size={30} color="#fff" /> // Change icon when recording
        ) : (
          <Icon name="mic" size={30} color="#fff" /> // Default icon
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    height: 150,
    backgroundColor: "#fff",
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});
