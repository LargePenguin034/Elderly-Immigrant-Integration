import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Audio } from "expo-av";
import { Platform } from 'react-native';
import { IOSOutputFormat } from "expo-av/build/Audio";
import Constants from 'expo-constants';

// Define Variables
const WEB_SOCKET = Constants.expoConfig.extra.WEB_SOCKET;
let ws;

// Defnite rocrding quality and output
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
 * 
 * 1. Requests microphone permissions from the user.
 * 2. Configures the audio mode for recording.
 * 3. Creates and starts a new audio recording instance.
 * 4. Updates the UI to indicate that the app is listening.
 * 5. Establishes a WebSocket connection to the server.
 * 6. On connection open:
 *    - Sends a message to the server to start audio streaming.
 *    - Sets an interval to read and send audio data to the server every second.
 * 7. Stops recording and streaming after a specified duration.
 * 8. Listens for incoming messages from the server to update the UI with transcriptions and translations.
 * 9. Handles WebSocket errors and connection status changes.
 */
async function startStreaming(setRecording, setInputSpeech, setTranslation, language) {
  try {
      // Request microphone permissions
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
          // Set audio mode for recording
          await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
          });

          // Create a new recording instance
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync(recordingOptions);
          await recording.startAsync(); // Start recording
          setRecording(recording); // Save the recording instance

          setInputSpeech("Listening..."); // Update UI to show listening status

          // Connect to the WebSocket server
          ws = new WebSocket(WEB_SOCKET);

          ws.onopen = () => {
              console.log("WebSocket connected");

              // Start streaming audio to the server, also send the language
              ws.send(JSON.stringify({ type: "start", device: Platform.OS, language }));
              
              // Set up a recurring interval to send audio data
              const intervalId = setInterval(async () => {
                  const uri = recording.getURI(); // Get the URI of the recording
                  const fileData = await FileSystem.readAsStringAsync(uri, {
                      encoding: FileSystem.EncodingType.Base64,
                  });
                  console.log("Sending audio data");
                  ws.send(JSON.stringify({ type: "audio", data: fileData })); // Send audio data to server
              }, 1000); // Stream audio every second

              // Stop recording and streaming after a certain time
              setTimeout(() => {
                  clearInterval(intervalId); // Clear the interval
                  stopStreaming(recording); // Stop the recording and streaming
              }, 10000); // Adjust timing as needed
          };

          // Handle incoming messages from the WebSocket
          ws.onmessage = (event) => {
              const { transcription, translation } = JSON.parse(event.data);
              setInputSpeech(transcription); // Update input speech with transcription
              setTranslation(translation); // Update translation
          };

          // Handle WebSocket errors
          ws.onerror = (event) => {
              console.error("WebSocket error observed:", event.message);
          };

          // Handle WebSocket close event
          ws.onclose = () => {
              setRecording(false)
              console.log("WebSocket closed");
          };
      }
  } catch (err) {
      console.log(err); // Log any errors
  }
}


/**
 * stopStreaming stops the audio recording and closes the WebSocket connection.
 * 
 * 1. If a recording instance is provided, it stops and unloads the recording.
 * 2. If the WebSocket connection exists, it sends a "stop" message to the server
 *    and then closes the WebSocket connection.
 */
  async function stopStreaming(recording) {

    if (recording) {
      await recording.stopAndUnloadAsync();
    }
    if (ws) {
      ws.send(JSON.stringify({ type: "stop" }));
      ws.close();
    }
  }
  
  export default {
    startStreaming,
    stopStreaming,
  };
