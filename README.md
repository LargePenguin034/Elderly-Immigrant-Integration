# Welcome to Traslify

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create .env in the backend folder with the following 
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=nimble-answer-434823-u3-2c626702566e.json
   OPEN_API_KEY = "your open api key"
   ```

3. edit app.json
   ```bash
    go to extra change WEB_SOCKET to "ws://Your IPV4 Address:8080"
   ```

4. Start The server
   ```bash
    node backend/server
   ```

5. Start the app

   ```bash
    npx expo start
   ```

## Important Files

UI
app/index.tsx

Audio Handling
components/audioUtils.js

Context
backend/context.js

Real Time Translation
backend/server.js

