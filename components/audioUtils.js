import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Audio } from "expo-av";
import { uploadAudioToGoogleSpeech } from "./apis";

async function startRecording(setRecording, setInputSpeech) {
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
      setInputSpeech("Listening...");
      setRecording(recording);
    }
  } catch (err) {
    console.log(err);
  }
}

async function stopRecording(recording, setRecording, setInputSpeech) {
  setRecording(null);

  await recording.stopAndUnloadAsync();
  const { sound, status } = await recording.createNewLoadedSoundAsync();
  const recordingURI = recording.getURI();

  // Read the file from the local file system as a binary
  const fileInfo = await FileSystem.getInfoAsync(recordingURI);
  if (!fileInfo.exists) {
    throw new Error("File does not exist");
  }
  const fileUri = fileInfo.uri;

  try {
    const transcription = await uploadAudioToGoogleSpeech(recordingURI);
    if (transcription) {
      setInputSpeech(`${transcription[0].alternatives[0].transcript}`);
      console.log(transcription[0].alternatives[0]);
    } else {
      setInputSpeech("talk for at least 2 seconds");
    }
  } catch (error) {
    setInputSpeech("Error processing audio");
  }

  
}

export default {
  stopRecording,
  startRecording,
};
