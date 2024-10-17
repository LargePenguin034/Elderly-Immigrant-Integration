import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
      return;
    }

    // Request microphone permissions
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== "granted") {
      console.error("Microphone permission not granted.");
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
          }
        }
      }, 2500); // Stream audio every 2.5 seconds

      // Optionally, set a timeout to stop recording after a certain duration
      // setTimeout(() => {
      //   clearInterval(intervalId); // Clear the interval
      //   stopStreaming(); // Stop the recording and streaming
      // }, 30000); // Adjust timing as needed
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
      }
    };

    // Handle WebSocket errors
    ws.onerror = (event) => {
      console.error("WebSocket error observed:", event.message);
    };

    // Handle WebSocket close event
    ws.onclose = (event) => {
      console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
      if (intervalId) { 
        clearInterval(intervalId);
        intervalId = null;
      }
      setRecording(false); // Update recording state here
      currentRecording = null; // Reset the recording instance
      ws = null; // Reset the WebSocket instance
    };
  } catch (err) {
    console.log("Error in startStreaming:", err); // Log any errors
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
          await ws.send(JSON.stringify({ type: "audio", data: fileData }));
        } catch (err) {
          console.error("Error reading audio file during stop:", err);
        }
      }

      // Send the 'stop' message to the backend
      ws.send(JSON.stringify({ type: "stop" }));
    }

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (currentRecording) {
      await currentRecording.stopAndUnloadAsync();
      currentRecording = null;
    }

    setTimeout(() => {
      // Close the WebSocket after ensuring all messages are sent
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, 500); // Adjust the delay as needed to ensure messages are sent
  } catch (err) {
    console.error("Error in stopStreaming:", err);
  }
}

export default {
  startStreaming,
  stopStreaming,
};
