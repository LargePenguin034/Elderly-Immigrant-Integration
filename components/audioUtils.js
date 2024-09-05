import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Audio } from "expo-av";
import Api from "./apis";

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

async function stopRecording(
  recording,
  setRecording,
  setInputSpeech,
  setTranslation
) {
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
  let transcription;

  try {
    transcription = await Api.uploadAudioToGoogleSpeech(recordingURI);
    if (transcription) {
      setInputSpeech(`${transcription[0].alternatives[0].transcript}`);
    } else {
      setInputSpeech("talk for at least 2 seconds");
    }
  } catch (error) {
    setInputSpeech("Error processing audio");
  }

  try {
    const translation = await Api.uploadGoogleTranslate(transcription[0].alternatives[0].transcript);
    if (translation) {
      setTranslation(`${translation}`);
      console.log(translation);
    } else {
      setTranslation("talk for at least 2 seconds");
    }
  } catch (error) {
    setTranslation("Translating Error");
    console.log(error)
  }
}

export default {
  stopRecording,
  startRecording,
};
