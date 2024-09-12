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
    const { type, data } = JSON.parse(messageString);

    if (type === 'start') {
      console.log('Starting new recognition stream');
      // Start the streaming recognition request
      recognizeStream = speechClient
        .streamingRecognize({
          config: {
            encoding: 'AMR_WB',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
          interimResults: true, // Return interim results as the user speaks
        })
        .on('data', async (data) => {
          //console.log('Data received from Google Speech API', data);
          if (data.results[0] && data.results[0].alternatives[0]) {
            const transcription = data.results[0].alternatives[0].transcript;
            console.log('Transcription:', transcription);

            // Translate the transcription
            const [translation] = await translate.translate(transcription, 'zh-CN');
            console.log('Translation:', translation);

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
      recognizeStream.write(audioData);
    }

    if (type === 'stop') {
      // Stop the stream when client ends it
      console.log('Stopping recognition stream');
      recognizeStream.end();
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
