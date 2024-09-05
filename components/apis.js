import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export async function uploadAudioToGoogleSpeech(recordingURI) {
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

    return response.data.results;
  } catch (error) {
    console.error("Error uploading audio to Google Speech-to-Text API:", error);
    throw error;
  }
}