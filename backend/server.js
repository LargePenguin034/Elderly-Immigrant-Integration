// server.js
const contextTranslate = require('./context');  // Custom translation function
const express = require('express');
const WebSocket = require('ws');
const speech = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const TranslationQueue = require('./TranslationQueue'); // Import the TranslationQueue class

require('dotenv').config();

const app = express();
const port = 3000;

// Initialize Google Cloud clients
const speechClient = new speech.SpeechClient();
const translate = new Translate();

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8082 });

// Define concurrency and queue limits
const MAX_CONCURRENT_TRANSLATIONS = 3; // Maximum concurrent translations
const MAX_QUEUE_SIZE = 3;              // Maximum number of tasks in the queue

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  let recognizeStream = null;
  let isClosed = false;

  // Initialize the TranslationQueue
  const translationQueue = new TranslationQueue(MAX_CONCURRENT_TRANSLATIONS, MAX_QUEUE_SIZE);

  // Variables for tracking transcriptions
  let lastTranscription = '';
  let sameTranscriptionCount = 0;

  // Handle incoming messages from the client
  ws.on('message', async (message) => {
    const messageString = message.toString();
    const { type, data, device, language } = JSON.parse(messageString);

    if (type === 'start') {
      const languageCode = language === 'zh' ? 'zh-CN' : 'en-US';

      // Configure the speech recognition based on device type
      let config;
      if (device === 'android') {
        config = {
          config: {
            encoding: 'AMR_WB',
            sampleRateHertz: 16000,
            languageCode: languageCode,
            enableAutomaticPunctuation: true, // Enable automatic punctuation
            single_utterance: false,          // Continuous recognition
          },
          interimResults: true
        };
      } else if (device === 'ios') {
        config = {
          config: {
            encoding: 'MULAW',
            sampleRateHertz: 8000,
            languageCode: languageCode,
            enableAutomaticPunctuation: true, // Enable automatic punctuation
            single_utterance: false,          // Continuous recognition
          },
          interimResults: true
        };
      }

      // Start the speech recognition stream
      recognizeStream = speechClient
        .streamingRecognize(config)
        .on('data', async (data) => {
          if (data.results[0] && data.results[0].isFinal && data.results[0].alternatives[0]) {
            // Extract and sanitize the transcription
            let transcription = data.results[0].alternatives[0].transcript.trim();

            // Normalize internal whitespace
            transcription = transcription.replace(/\s+/g, ' ');

            console.log('Transcription:', transcription);

            // Check if the transcription has changed to prevent redundancy
            if (transcription === lastTranscription) {
              sameTranscriptionCount += 1;
              console.log(`Same transcription received ${sameTranscriptionCount} times in a row.`);
            } else {
              sameTranscriptionCount = 1;
              lastTranscription = transcription;
              console.log('Transcription updated.');
            }

            // If the same transcription is received three times consecutively, stop streaming
            if (sameTranscriptionCount >= 3) {
              console.log('Same transcription received three times. Stopping streaming.');
              
              // Stop the recognition stream
              if (recognizeStream) {
                recognizeStream.end();
              }

              // Close the WebSocket connection gracefully
              if (ws.readyState === WebSocket.OPEN) {
                ws.close(1000, 'Normal closure due to repeated transcriptions');
                console.log('WebSocket closed gracefully due to repeated transcriptions.');
              }

              isClosed = true; // Prevent further actions after closure
              return; // Exit the handler to prevent further processing
            }

            // Enqueue the translation task if transcription has changed
            if (sameTranscriptionCount === 1) {
              // Determine target language for translation
              const targetLanguage = language === 'zh' ? 'en' : 'zh-CN';

              // Define the translation task as an asynchronous function
              const translationTask = async () => {
                try {
                  // Perform the translation using the custom contextTranslate function
                  const translation = await contextTranslate(transcription, targetLanguage); 
                  console.log('Contexted Translation:', translation);

                  // Send the translation back to the client
                  if (ws.readyState === WebSocket.OPEN) {
                    await ws.send(JSON.stringify({ transcription, translation }));
                    console.log('Successfully sent transcription and translation to client');
                  }
                } catch (err) {
                  console.error('Error during translation or sending message:', err);
                  // Optionally, send an error message to the client
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ error: 'Translation failed' }));
                  }
                }
              };

              // Enqueue the translation task
              translationQueue.enqueue(translationTask);
            } else {
              console.log('Transcription unchanged. Skipping translation.');
            }
          }
        })
        .on('error', (err) => {
          console.error('Speech-to-text error:', err);
          if (!isClosed) {
            ws.close(1011, 'Internal error'); // Close with appropriate error code
            isClosed = true;
          }
        })
        .on('end', async () => {
          console.log('Recognition stream ended');
          // Wait for all translation tasks to complete before closing the WebSocket
          await translationQueue.waitUntilEmpty();

          if (ws.readyState === WebSocket.OPEN && !isClosed) {
            ws.close(1000, 'Normal closure');
            isClosed = true;
            console.log('WebSocket closed gracefully after all data sent');
          }
        });
    }

    if (type === 'audio') {
      // Write audio data to the speech recognition stream
      console.log('Audio data received'); // Confirm audio data is received
      const audioData = Buffer.from(data, 'base64');
      console.log('Writing audio data to the stream', audioData.length + ' bytes');
      if (recognizeStream) {
        recognizeStream.write(audioData);
      }
    }

    if (type === 'stop') {
      // Stop the speech recognition stream
      console.log('Stopping recognition stream and preparing to close connection');
      if (recognizeStream) {
        recognizeStream.end();
      }
      // Do not close the WebSocket here; let the 'end' event handler manage it
    }
  });

  // Handle unexpected WebSocket closures
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

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
