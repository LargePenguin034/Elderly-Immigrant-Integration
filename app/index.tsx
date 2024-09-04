import React from "react";
import { StyleSheet, TextInput, Text, View, Button } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import axios from "axios";

export default function App() {
  const [recording, setRecording] = React.useState();
  const [text, setText] = React.useState("");
  const [response, setResponse] = React.useState(null);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setText("Listening...");
        setRecording(recording);
      }
    } catch (err) {}
  }

  async function stopRecording() {
    setRecording(null);

    await recording.stopAndUnloadAsync();
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    const recordingURI = recording.getURI();

    try {
      // Read the file from the local file system as a binary
      const fileInfo = await FileSystem.getInfoAsync(recordingURI);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }
      const fileUri = fileInfo.uri;

      const audioBytes = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const apiKey = "AIzaSyBTAAv6orzl6HxDtSDO975wx_5K-ueLdtY"; // Replace with your actual API key

      // Send the audio data to Google Speech-to-Text
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          audio: {
            content: audioBytes,
          },
          config: {
            encoding: "MP3", // Ensure the audio file format matches
            sampleRateHertz: 16000,
            languageCode: "en-US",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const transcription = response.data.results;
      setText(
        `${transcription[0].alternatives[0].transcript}`
      );
      console.log(transcription[0].alternatives[0]);
    } catch (error) {
      console.error(
        "Error uploading audio to Google Speech-to-Text API:",
        error
      );
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        value={text}
        editable={false}
        onChangeText={(newText) => setText(newText)}
        placeholder="Start typing..."
        multiline
      />
      <Button
        title={recording ? "Stop Recording" : "Start Recording\n\n\n"}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    height: 150,
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
