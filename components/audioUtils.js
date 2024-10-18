import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Define Variables
const WEB_SOCKET = Constants.expoConfig.extra.WEB_SOCKET;
let ws = null;
let intervalId = null;
let currentRecording = null; // Track the current recording instance

// Define recording quality and output
const recordingOptions = {
  android: {
    extension: '.amr',
    outputFormat: Audio.AndroidOutputFormat.AMR_WB,
    audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.ULAW,
    audioQuality: Audio.IOSAudioQuality.MIN,
    sampleRate: 8000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

/**
 * startStreaming initializes audio recording and streams the recorded audio data to a WebSocket server.
 */
async function startStreaming(setRecording, setInputSpeech, setTranslation, language) {
  try {
    // Prevent starting a new recording if one is already in progress
    if (currentRecording !== null) {
      console.warn("A recording is already in progress.");
      Alert.alert("Recording Active", "Please stop the current recording before starting a new one.");
      return;
    }

    // Request microphone permissions
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== "granted") {
      console.error("Microphone permission not granted.");
      Alert.alert("Permission Denied", "Please grant microphone permissions to use this feature.");
      return;
    }

    // Set audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create a new recording instance
    currentRecording = new Audio.Recording();
    await currentRecording.prepareToRecordAsync(recordingOptions);
    await currentRecording.startAsync(); // Start recording
    setRecording(true); // Update recording state in the frontend

    setInputSpeech("Listening..."); // Update UI to show listening status

    // Connect to the WebSocket server
    ws = new WebSocket(WEB_SOCKET);

    ws.onopen = () => {
      console.log("WebSocket connected");

      // Start streaming audio to the server, also send the language
      ws.send(JSON.stringify({ type: "start", device: Platform.OS, language }));

      // Set up a recurring interval to send audio data
      intervalId = setInterval(async () => {
        const uri = currentRecording.getURI(); // Get the URI of the recording
        if (uri) { // Ensure URI is available
          try {
            const fileData = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            console.log("Sending audio data");
            ws.send(JSON.stringify({ type: "audio", data: fileData })); // Send audio data to server
          } catch (err) {
            console.error("Error reading audio file:", err);
            Alert.alert("Error", "Failed to read audio data.");
          }
        }
      }, 1500); // Stream audio every 1 second (adjust as needed)
    };

    // Handle incoming messages from the WebSocket
    ws.onmessage = (event) => {
      console.log('Received incoming message from the WebSocket:', event.data);
      try {
        const message = JSON.parse(event.data);
        if (message.transcription && message.translation) {
          console.log("Received transcription and translation:", message);
          setInputSpeech(message.transcription); // Update input speech with transcription
          setTranslation(message.translation); // Update translation
        }
      } catch (err) {
        console.error("Error parsing incoming message:", err);
        Alert.alert("Error", "Received malformed data from the server.");
      }
    };

    // Handle WebSocket errors
    ws.onerror = (event) => {
      console.error("WebSocket error observed:", event.message);
      Alert.alert("WebSocket Error", "An error occurred with the WebSocket connection.");
    };

    // Handle WebSocket close event
    ws.onclose = async (event) => {
      console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
      if (intervalId) { 
        clearInterval(intervalId);
        intervalId = null;
      }
      if (ws) {
        ws = null;
      }
      if (currentRecording) {
        try {
          console.log('Unloading and setting recording to false');
          await currentRecording.stopAndUnloadAsync();
          setRecording(false); // Update recording state here
          currentRecording = null; // Reset the recording instance
        } catch (err) {
          console.error("Error stopping and unloading recording:", err);
          setRecording(false);
          currentRecording = null;
        }
      }
    };
  } catch (err) {
    console.log("Error in startStreaming:", err); // Log any errors
    Alert.alert("Error", "An unexpected error occurred while starting the recording.");
  }
}

/**
 * stopStreaming stops the audio recording and signals the backend to stop streaming.
 * It also sends any remaining audio data that hasn't been sent yet.
 */
async function stopStreaming() {
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Read and send any remaining audio data before stopping
      const uri = currentRecording.getURI();
      if (uri) {
        try {
          const fileData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log("Sending remaining audio data before stopping");
          ws.send(JSON.stringify({ type: "audio", data: fileData }));
        } catch (err) {
          console.error("Error reading audio file during stop:", err);
          Alert.alert("Error", "Failed to read final audio data.");
        }
      }

      // Send the 'stop' message to the backend
      ws.send(JSON.stringify({ type: "stop" }));
    }

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    // Do NOT close the WebSocket here; the server will handle it after all translations are sent
  } catch (err) {
    console.error("Error in stopStreaming:", err);
    Alert.alert("Error", "An unexpected error occurred while stopping the recording.");
  }
}

export default {
  startStreaming,
  stopStreaming,
};
