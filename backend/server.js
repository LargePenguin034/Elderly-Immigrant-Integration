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
const wss = new WebSocket.Server({ port: 8082 });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  let recognizeStream = null;
  let isClosed = false;
  let isStopped = false; // Flag to indicate stop received
  const translationPromises = []; // Array to track ongoing translation tasks

  // Handle incoming messages
  ws.on('message', async (message) => {
    const messageString = message.toString();
    const { type, data, device, language } = JSON.parse(messageString);

    if (type === 'start') {
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
          if (data.results[0] && data.results[0].isFinal && data.results[0].alternatives[0]) {
            const transcription = data.results[0].alternatives[0].transcript;
            console.log('Transcription:', transcription);

            // Determine target language for translation
            const targetLanguage = language === 'zh' ? 'en' : 'zh-CN';

            // Create a translation promise
            const translationPromise = (async () => {
              try {
                // Use your contextTranslate function for translation
                const translation = await contextTranslate(transcription, targetLanguage); 
                console.log('Contexted Translation:', translation);

                // Send transcription and translation back to the client
                if (ws.readyState === WebSocket.OPEN) {
                  await ws.send(JSON.stringify({ transcription, translation }));
                  console.log('Successfully sent transcription and translation to client');
                }
              } catch (err) {
                console.error('Error during translation or sending message:', err);
              }
            })();

            // Add the promise to the tracker
            translationPromises.push(translationPromise);

            // Once the promise is settled, remove it from the tracker
            translationPromise.finally(() => {
              const index = translationPromises.indexOf(translationPromise);
              if (index > -1) {
                translationPromises.splice(index, 1);
              }
            });
          }
        })
        .on('error', (err) => {
          console.error('Speech-to-text error:', err);
          if (!isClosed) {
            ws.close(1011, 'Internal error'); // Close with appropriate error code
            isClosed = true;
          }
        })
        .on('end', () => {
          console.log('Recognition stream ended');
          // Wait for all translation promises to resolve before closing the WebSocket
          Promise.all(translationPromises)
            .then(() => {
              if (ws.readyState === WebSocket.OPEN && !isClosed) {
                ws.close(1000, 'Normal closure');
                isClosed = true;
                console.log('WebSocket closed gracefully after all data sent');
              }
            })
            .catch((err) => {
              console.error('Error waiting for translations to complete:', err);
              if (ws.readyState === WebSocket.OPEN && !isClosed) {
                ws.close(1011, 'Error during translation processing');
                isClosed = true;
                console.log('WebSocket closed due to translation processing error');
              }
            });
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
      // Stop the stream when client ends it
      console.log('Stopping recognition stream and preparing to close connection');
      isStopped = true;
      if (recognizeStream) {
        recognizeStream.end();
      }
      // Do not close the WebSocket here; let the 'end' event handler close it after sending
    }
  });

  // Handle connection closure
  ws.on('close', () => {
    console.log('Connection closed');
    if (recognizeStream) {
      recognizeStream.end();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
