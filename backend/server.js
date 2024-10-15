const contextTranslate = require('./context');  // Use instead of google translate for contexts
const express = require('express');
const WebSocket = require('ws');
const speech = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;

require('dotenv').config();

const app = express();
const port = 3000;

// Google Cloud Speech client
const speechClient = new speech.SpeechClient();
const translate = new Translate();

// WebSocket server for streaming audio
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  let recognizeStream = null;

  // Start streaming audio to Google Cloud when a new connection is opened
  ws.on('message', async (message) => {
    const messageString = message.toString();
    console.log('Received message:', messageString);
    const { type, data, device, language } = JSON.parse(messageString);

    if (type === 'start') {
      //console.log('Starting new recognition stream for device:', device);
      const languageCode = language === 'zh' ? 'zh-CN' : 'en-US';

      // Determine the configuration based on the device type
      let config;
      if (device === 'android') {
        config = {
          config: {
            encoding: 'AMR_WB',
            sampleRateHertz: 16000,
            languageCode: languageCode,
          },
          interimResults: true
        };
      } else if (device === 'ios') {
        config = {
          config: {
            encoding: 'MULAW',
            sampleRateHertz: 8000,
            languageCode: languageCode,
          },
          interimResults: true
        };
      }

      // Start the streaming recognition request
      recognizeStream = speechClient
        .streamingRecognize(config)
        .on('data', async (data) => {
          //console.log('Data received from Google Speech API', data);
          if (data.results[0] && data.results[0].isFinal && data.results[0].alternatives[0]) {
            const transcription = data.results[0].alternatives[0].transcript;
            console.log('Transcription:', transcription);

            // Determine target language for translation
            const targetLanguage = language === 'zh' ? 'en' : 'zh-CN';

            // Translate the transcription (google translate)
            const [translation] = await translate.translate(transcription, targetLanguage);

            // OPENAI context translation
            //const translation = await contextTranslate(transcription) 
            console.log('Contexted Translation:', translation);

            // Send transcription and translation back to the client
            ws.send(JSON.stringify({ transcription, translation }));
          }
        })
        .on('error', async (err) => {
          console.error('Speech-to-text error:', err);
        });
    }

    if (type === 'audio') {
      // Write audio data to the recognize stream
      console.log('Audio data received'); // Confirm audio data is received
      const audioData = Buffer.from(data, 'base64');
      console.log('Writing audio data to the stream', audioData.length + ' bytes');
      if (recognizeStream) {
        recognizeStream.write(audioData);
      }
    }

    if (type === 'stop') {
      // Stop the stream when client ends it and close the connection
      console.log('Stopping recognition stream and closing connection');
      if (recognizeStream) {
        recognizeStream.end();
      }
      ws.close(); // Close the WebSocket connection
    }
  });

  // Handle connection closure
  ws.on('close', () => {
    console.log('Connection closed');
    if (recognizeStream) {
      recognizeStream.end();
    }

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
