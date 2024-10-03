import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import Config from 'react-native-config';

export async function uploadAudioToGoogleSpeech(recordingURI) {
  try {
    // Read the file from the local file system as a binary
    const fileInfo = await FileSystem.getInfoAsync(recordingURI);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }
    const fileUri = fileInfo.uri;

    const audihnoBytes = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const GOOGLE_API_KEY = 'AIzaSyApSRpKSpSzeNKcnldtuBoGQ62_ZSUPX5Y';

    // Send the audio data to Google Speech-to-Text
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
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

export async function uploadGoogleTranslate(text) {
    try {
        const GOOGLE_API_KEY = 'AIzaSyApSRpKSpSzeNKcnldtuBoGQ62_ZSUPX5Y';
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          q: text,
          target: "zh-CN",
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const translatedText = response.data.data.translations[0].translatedText;
      console.log('Translated Text:', translatedText);
      return translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  };

export default {
    uploadAudioToGoogleSpeech,
    uploadGoogleTranslate,
  };