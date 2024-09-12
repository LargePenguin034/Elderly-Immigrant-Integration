import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Audio } from "expo-av";
import Api from "./apis";

let ws;

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
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

async function startStreaming(setRecording, setInputSpeech, setTranslation) {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
  
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
          recordingOptions
        );
        await recording.startAsync();
        setRecording(recording);
  
        setInputSpeech("Listening...");
  
        // Connect to the WebSocket server
        ws = new WebSocket("ws://192.168.1.103:8080");
  
        ws.onopen = () => {
          console.log("WebSocket connected");
  
          // Start streaming audio to the server
          ws.send(JSON.stringify({ type: "start" }));
          const intervalId = setInterval(async () => {
            const uri = recording.getURI();
            const fileData = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            console.log("Sending audio data")
            ws.send(JSON.stringify({ type: "audio", data: fileData }));
          }, 1000); // Stream audio every second
        
          // Stop recording and streaming after a certain time
          setTimeout(() => {
            clearInterval(intervalId);
            stopStreaming(recording);
          }, 10000); // Adjust timing as needed
        };
  
        ws.onmessage = (event) => {
          const { transcription, translation } = JSON.parse(event.data);
          setInputSpeech(transcription);
          setTranslation(translation);
        };
        
        ws.onerror = (event) => {
          console.error("WebSocket error observed:", event.message);
        };
          
        ws.onclose = () => {
          console.log("WebSocket closed");
        };
      }
    } catch (err) {
      console.log(err);
    }
  }
  
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
