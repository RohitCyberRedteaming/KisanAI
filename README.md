# 🌾 KisanAI — भारतीय किसानों का AI सहायक

<div align="center">

![KisanAI Banner](./assets/icon.png)

**KisanAI** एक React Native (Expo) आधारित मोबाइल ऐप है जो भारतीय किसानों को AI की मदद से फसल रोग पहचान, मौसम सलाह, मंडी भाव और सरकारी योजनाओं की जानकारी देता है।

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-blue)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-green)](https://reactnative.dev)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Opus-purple)](https://anthropic.com)

</div>

---

## 📱 App Features

| Feature | Description |
|---|---|
| 🔬 **फसल रोग स्कैन** | Camera से फोटो लो — AI तुरंत रोग पहचानेगा |
| 🤖 **KisanAI Chat** | Claude AI से हिंदी में कृषि सलाह |
| 🌤️ **मौसम सलाह** | Location के अनुसार खेती सुझाव |
| 📊 **मंडी भाव** | Real-time फसल के दाम |
| 📋 **सरकारी योजनाएँ** | PM-KISAN, फसल बीमा, KCC आदि |
| 📡 **IoT स्मार्ट खेती** | Sensor data और pump control |
| 🛰️ **Satellite Data** | NDVI फसल स्वास्थ्य |
| 👆 **Fingerprint Login** | Biometric authentication |

---

## 🛠️ Tech Stack

- **Framework:** React Native + Expo SDK 51
- **Navigation:** Expo Router (File-based)
- **AI:** Anthropic Claude Opus API
- **Storage:** AsyncStorage
- **Authentication:** expo-local-authentication (Biometric)
- **Build:** EAS Build (Cloud)
- **Updates:** EAS Update (OTA)

---

## ⚙️ Installation & Setup

### Prerequisites

| Tool | Version | Check Command |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | Any | `git --version` |
| EAS CLI | Latest | `eas --version` |

### Step 1 — Repository Clone करो

```bash
git clone https://github.com/RohitCyberRedteaming/KisanAI.git
cd KisanAI
```

### Step 2 — Dependencies Install करो

```bash
npm install --legacy-peer-deps
```

> ⚠️ `--legacy-peer-deps` जरूरी है वरना peer dependency conflicts आएंगे।

### Step 3 — Environment Variables Set करो

`.env` file बनाओ project root में:

```env
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key_here
EXPO_PUBLIC_BACKEND_URL=your_backend_url
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

> 🔑 Anthropic API Key के लिए: [console.anthropic.com](https://console.anthropic.com)

### Step 4 — `.npmrc` File बनाओ

```bash
echo "legacy-peer-deps=true" > .npmrc
```

### Step 5 — EAS Login करो

```bash
npm install -g eas-cli
eas login
```

---

## 📦 APK Build Process (EAS Cloud Build)

### पहली बार APK बनाना

```bash
# Step 1: Git initialize करो
git init
git add .
git commit -m "Initial commit"

# Step 2: EAS से connect करो
eas login

# Step 3: APK build करो
eas build --platform android --profile preview
```

> ⏳ Build में **15-20 मिनट** लगते हैं। Link मिलेगा जहाँ से APK download करें।

### Build Profiles (eas.json)

| Profile | Purpose | Build Type |
|---|---|---|
| `preview` | Testing APK | `.apk` direct install |
| `production` | Play Store | `.aab` signed bundle |

```bash
# Preview APK (testing के लिए)
eas build --platform android --profile preview

# Production AAB (Play Store के लिए)
eas build --platform android --profile production
```

### Build Status Check करना

```bash
eas build:list
```

या browser में देखो: [expo.dev](https://expo.dev/accounts/rohit.soc93/projects/kisanai/builds)

---

## 🔄 OTA Update Process (बिना APK Download के)

> एक बार APK install हो जाए — आगे के code changes के लिए **OTA Update** use करो।

### Step 1 — Version बढ़ाओ (`app.json`)

```json
{
  "expo": {
    "version": "1.0.1"  ← यह बढ़ाओ हर update पर
  }
}
```

### Step 2 — Changes Commit करो

```bash
git add .
git commit -m "v1.0.1 - Bug fixes description"
```

### Step 3 — OTA Update भेजो

```bash
eas update --channel preview --message "Bug fixes v1.0.1"
```

### Step 4 — Phone पर Update लो

App बंद करो → दोबारा खोलो → **Automatic Update** ✅

> 📌 Note: अगर Native code बदला (permissions, new packages) तो नया APK build करना होगा।

---

## 🐛 Issues Faced & Solutions

### Issue 1 — `./gradlew` Command Not Found

**Error:**
```
'./gradlew' is not recognized as the name of a cmdlet
```

**Cause:** Windows PowerShell में `./` Unix syntax है।

**Solution:**
```powershell
# Wrong ❌
./gradlew assembleDebug

# Correct ✅
.\gradlew assembleDebug
```

---

### Issue 2 — `gradlew` File ही नहीं था

**Error:**
```
gradlew : The term 'gradlew' is not recognized
```

**Cause:** Project root में `gradlew` file नहीं थी — यह Expo project था, native Android नहीं।

**Solution:** Expo project के लिए Gradle directly नहीं चलाते:
```bash
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleDebug
```

---

### Issue 3 — Gradle 9.0 + Kotlin Incompatibility

**Error:**
```
Incompatible classes were found in dependencies.
The binary version of its metadata is 2.2.0, expected version is 1.9.0.
```

**Cause:** System पर Gradle 9.0 था जिसमें Kotlin 2.2.0 था, लेकिन React Native 0.76 के gradle-plugin को Kotlin 1.9.0 चाहिए था।

**Solution:** `android/gradle/wrapper/gradle-wrapper.properties` में Gradle version बदला:
```properties
# Wrong ❌
distributionUrl=https\://services.gradle.org/distributions/gradle-9.0.0-bin.zip

# Correct ✅
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip
```

---

### Issue 4 — `expo-local-authentication@15.1.4` Not Found

**Error:**
```
npm error notarget No matching version found for expo-local-authentication@~15.1.4
```

**Cause:** यह version exist ही नहीं करती।

**Solution:** `package.json` में सही version डाला:
```json
"expo-local-authentication": "~14.0.1"
```

---

### Issue 5 — React 19 + React Native 0.76 Conflict

**Error:**
```
peer react@"^18.2.0" from react-native@0.76.5
```

**Cause:** `react@19.2.0` React Native 0.76 के साथ incompatible है।

**Solution:**
```json
"react": "18.3.1",
"react-dom": "18.3.1",
"react-native": "0.76.5"
```

---

### Issue 6 — Expo SDK 55 Local Build Fails

**Cause:** Expo SDK 55 + React Native 0.83 का combination local Gradle build के साथ बहुत conflicts देता है। `expo-modules-autolinking` Gradle 8.7 के साथ incompatible है।

**Solution:** SDK 55 → **SDK 51** downgrade किया जो stable है:
```json
"expo": "~51.0.28",
"react-native": "0.74.5",
"react": "18.2.0"
```

---

### Issue 7 — `fs-extra` Module Not Found (EAS Build)

**Error:**
```
Error: Cannot find module 'fs-extra'
```

**Cause:** `expo-updates` की dependency `fs-extra` install नहीं थी।

**Solution:**
```bash
npm install fs-extra --legacy-peer-deps
```

---

### Issue 8 — EAS Build: Assets Missing

**Error:**
```
ENOENT: no such file or directory, open './assets/adaptive-icon.png'
```

**Cause:** `assets/` folder git में add नहीं था।

**Solution:**
```bash
git add assets/
git commit -m "Add assets folder"
eas build --platform android --profile preview
```

---

### Issue 9 — Android Folder Locked (Cannot Delete)

**Error:**
```
Cannot remove the item at 'android' because it is in use
```

**Cause:** PowerShell उसी folder में था जिसे delete करना था।

**Solution:**
```powershell
cd D:\devOps\KisanAI-Fresh  # पहले बाहर जाओ
Remove-Item -Recurse -Force .\android
```

---

### Issue 10 — AI Wrong Result (Paper को Plant समझा)

**Cause:** AI prompt में यह check नहीं था कि image plant की है या नहीं।

**Solution:** `utils/api.ts` में improved prompt:
```javascript
// पहले यह check करो — क्या यह plant है?
"STEP 1: क्या यह तस्वीर किसी पौधे की है?"
"अगर नहीं — isNotPlant: true दें"
```

---

### Issue 11 — PowerShell में `(tabs)` Folder Error

**Error:**
```
tabs : The term 'tabs' is not recognized
```

**Cause:** PowerShell में `()` brackets को command समझता है।

**Solution:** हमेशा quotes में लिखो:
```powershell
# Wrong ❌
cd app\(tabs)\

# Correct ✅
cd "app\(tabs)\"
Copy-Item "source.tsx" "app\(tabs)\more.tsx" -Force
```

---

## 📁 Project Structure

```
KisanAI/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Home screen
│   │   ├── scan.tsx       # Camera scan
│   │   ├── market.tsx     # Mandi prices
│   │   ├── weather.tsx    # Weather
│   │   ├── more.tsx       # Settings + Features
│   │   └── _layout.tsx    # Tab navigation
│   ├── analyzing.tsx      # AI analysis result
│   ├── camera.tsx         # Camera component
│   ├── chat.tsx           # KisanAI chatbot
│   ├── login.tsx          # Login screen
│   ├── notifications.tsx  # Notifications
│   ├── scan-detail.tsx    # Scan history detail
│   └── _layout.tsx        # Root layout
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── notification-icon.png
├── components/
│   └── UI.tsx             # Reusable components
├── constants/
│   ├── Colors.ts          # Color palette
│   └── Data.ts            # Disease data
├── contexts/
│   └── AppContext.tsx     # Global state
├── utils/
│   ├── api.ts             # Anthropic API calls
│   ├── storage.ts         # AsyncStorage helpers
│   └── updateChecker.ts   # OTA update checker
├── .env                   # API Keys (git ignore करो!)
├── .npmrc                 # npm config
├── app.json               # Expo config
├── eas.json               # EAS Build config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | ✅ Yes | Claude AI API Key |
| `EXPO_PUBLIC_OPENWEATHER_API_KEY` | ✅ Yes | Weather data |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Optional | Maps |
| `EXPO_PUBLIC_BACKEND_URL` | Optional | Custom backend |

---

## 📋 Quick Commands Reference

```bash
# Development start
npx expo start

# Android emulator
npx expo run:android

# Fresh prebuild
npx expo prebuild --platform android --clean

# EAS Build (APK)
eas build --platform android --profile preview

# OTA Update (no APK needed)
eas update --channel preview --message "Your message"

# Build list check
eas build:list

# Install dependencies
npm install --legacy-peer-deps
```

---

## 👨‍💻 Developer

**Rohit** — [@RohitCyberRedteaming](https://github.com/RohitCyberRedteaming)

Built with ❤️ for Indian Farmers 🌾

---

## 📄 License

MIT License — Free to use and modify.
