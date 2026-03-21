# 🌾 KisanAI — किसान का AI साथी

A complete AI-powered farming assistant Android app built with React Native (Expo).

---

## 🚀 Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔬 AI Crop Disease Detection | Camera/Gallery → AI detects disease + treatment |
| 2 | 🌦️ Smart Weather Advisory | 5-day forecast + AI farming advice |
| 3 | 🌱 AI Crop Recommendation | Soil/season/region → Best crop suggestion |
| 4 | 🎤 Hindi Voice Assistant | Speech-to-text + Text-to-speech in Hindi |
| 5 | 📴 Offline Mode | SQLite local storage, cached data |
| 6 | 📊 Market Price Intelligence | Live mandi prices + AI sell/hold advice |
| 7 | 📡 IoT Integration | Soil moisture, pH, temperature sensors |
| 8 | 🧑‍🌾 Farmer Profile + History | Crop history, yield tracking, scan records |
| 9 | 🤖 AI Chatbot | Claude-powered agri expert chatbot |
| 10 | 🚨 Alert System | Weather warnings, pest alerts |
| 11 | 🌍 Hindi-first UI | Full Devanagari throughout |
| 12 | 🛰️ Satellite NDVI | Crop health index visualization |
| 13 | 👥 Community | Farmer social network |

---

## 📁 Project Structure

```
KisanAI/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Bottom tab navigator
│   │   ├── index.tsx          # 🏠 Home Dashboard
│   │   ├── scan.tsx           # 🔬 Scan History
│   │   ├── weather.tsx        # 🌦️ Weather
│   │   ├── market.tsx         # 📊 Mandi Prices
│   │   └── more.tsx           # ☰ More (Crops, Community, IoT, etc.)
│   ├── _layout.tsx            # Root layout
│   ├── camera.tsx             # 📷 Camera screen
│   ├── analyzing.tsx          # 🤖 AI Analysis
│   ├── chat.tsx               # 💬 Chatbot
│   └── scan-detail.tsx        # 📋 Scan Details
├── components/
│   └── UI.tsx                 # Shared UI components
├── constants/
│   ├── Colors.ts              # Theme colors
│   └── Data.ts                # Mock data & disease DB
├── contexts/
│   └── AppContext.tsx         # Global state (AsyncStorage)
├── utils/
│   ├── api.ts                 # Anthropic API helpers
│   └── storage.ts             # SQLite offline storage
├── .env                       # API keys (rename from .env.example)
├── app.json                   # Expo config
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for emulator) OR physical Android device

### 2. Install Dependencies
```bash
cd KisanAI
npm install
```

### 3. Add API Keys
Edit `.env`:
```env
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
EXPO_PUBLIC_OPENWEATHER_API_KEY=your-openweather-key
```

Get keys:
- Anthropic: https://console.anthropic.com
- OpenWeather: https://openweathermap.org/api

### 4. Run on Android

**Option A — Physical device (easiest):**
```bash
npx expo start
# Scan QR code with Expo Go app
```

**Option B — Android Emulator:**
```bash
npx expo start --android
```

**Option C — Build APK:**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## 📱 Screens Overview

### Home Dashboard
- Farmer greeting + weather mini card
- Quick action grid (Scan, Crops, Chat, Community)
- Live alerts (weather, pests, prices)
- Market prices preview
- 5-day forecast strip

### Disease Detection (Scan tab)
- Camera capture with focus frame overlay
- Gallery upload
- AI analysis with progress bar
- Result: disease name, confidence %, symptoms, treatment steps
- Hindi voice readout of results

### Weather
- Full weather card with humidity, wind, UV
- 5-day forecast
- AI farming advisory (do/don't today)
- Pest risk meter

### Market (Mandi)
- 10 crop prices with trend badges
- Mandi selector
- AI sell/hold advice

### AI Chatbot
- Full conversation with Claude API
- Quick question chips
- Voice response (Hindi TTS)
- Disease-context aware

### More Tab
- Crop Recommendation (soil/season/region chips)
- Community posts
- IoT sensor dashboard
- Satellite NDVI view
- Government schemes

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo 51 |
| Navigation | Expo Router (file-based) |
| AI | Anthropic Claude API |
| Camera | expo-camera |
| Voice | expo-speech (TTS), Speech Recognition |
| Offline DB | expo-sqlite |
| Storage | AsyncStorage |
| Gradient | expo-linear-gradient |
| Icons | @expo/vector-icons |

---

## 🌐 API Integration

### Claude API (Disease Detection)
```typescript
// Sends base64 image → returns JSON with disease info
const result = await analyzeImage(imageBase64);
// { diseaseName, nameEng, confidence, severity, symptoms, treatment[] }
```

### Claude API (Chatbot)
```typescript
const reply = await chatWithAI(userMessage, diseaseContext);
```

---

## 📦 Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure build
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build Android AAB (Play Store)
eas build --platform android --profile production
```

---

## 🇮🇳 Made for Indian Farmers

- Hindi-first UI (Devanagari script)
- Works with low-end Android devices
- Offline mode for rural areas
- Supports UP, MP, Punjab, Haryana, Maharashtra, Bihar

---

## 📄 License
MIT — Free to use and modify
