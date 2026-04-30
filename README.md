# NutriBridge AI – Nutrition & Health Decision System

NutriBridge AI helps farmers tackle crop diseases using state-of-the-art AI. By combining real-time image detection with weather-aware reasoning, it provides personalized recommendations that save costs and protect yields.

## Features

- **AI Disease Detection**: Powered by simulated Vertex AI models for common crops (Tomato, Rice, Corn).
- **Intelligent Decision Engine**: Gemini AI generates specific actions, estimated costs, and timing.
- **Weather-Aware Logic**: Automatically delays chemical treatments if rain is expected in your region.
- **Regional Heatmap**: Visualizes disease trends (history) to help in preventative farming.
- **History Tracking**: Securely stores your farm's records in Firebase.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion (animations).
- **Backend**: Express.js (proxy for Weather API & Detection).
- **Database**: Firebase Firestore.
- **Storage**: Firebase Storage.
- **AI**: Gemini 3 Flash (via `@google/genai`).
- **External API**: OpenWeather API.

## Setup Instructions

1. **Environment Variables**:
   - `GEMINI_API_KEY`: Required for AI reasoning (auto-injected in AI Studio).
   - `VITE_OPENWEATHER_API_KEY`: Get a free key from [OpenWeatherMap](https://openweathermap.org/api).

2. **Backend**:
   - The server acts as a proxy for weather data and detection logic.
   - Run via `npm run dev`.

3. **Firebase**:
   - Firestore rules are enforced for data safety.
   - Images are uploaded to Firebase Storage.

## Usage

1. Sign in with Google to track your history.
2. Select your crop type (e.g., Tomato).
3. Upload a clear image of the affected plant part.
4. Click **Start Detection**.
5. Review the AI-generated treatment plan and weather advice.
