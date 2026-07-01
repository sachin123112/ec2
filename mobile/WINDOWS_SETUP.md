# PawMart Mobile App Windows Setup

This guide explains how to configure your Windows machine to run the mobile app with Expo and Android emulators.

## 1. Install Node.js

- Download and install Node.js 20.x from: https://nodejs.org/
- Verify in PowerShell:

```powershell
node --version
npm --version
```

## 2. Install Expo CLI

In a terminal, run:

```powershell
npm install -g expo-cli
```

Verify:

```powershell
expo --version
```

## 3. Install Git (optional)

If not installed, download from https://git-scm.com/.

## 4. Install Android Studio

- Download Android Studio from https://developer.android.com/studio
- During install, include Android SDK, SDK Platform, and Android Emulator.
- Open Android Studio > SDK Manager > install Android 13 (Tiramisu) or later.
- Open AVD Manager > create a Pixel 4 or Pixel 5 emulator.

## 5. Configure Android Emulator

- Start the emulator from Android Studio or the `adb` command.
- Verify the emulator is connected:

```powershell
adb devices
```

It should show a device with status `device`.

## 6. Run the mobile app

From the `mobile` folder:

```powershell
cd mobile
npm install
npm run start
```

Then choose `Run on Android device/emulator` from Expo, or run:

```powershell
npm run android
```

## 7. Backend API configuration

The mobile app expects the backend at:

- Android emulator: `http://10.0.2.2:8080/api/v1`
- iOS simulator: `http://localhost:8080/api/v1`

If you use a physical device, update `mobile/src/api/config.js`:

```js
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
  ? 'http://<YOUR_PC_IP>:8080/api/v1'
  : 'http://<YOUR_PC_IP>:8080/api/v1';

export default { API_URL };
```

Replace `<YOUR_PC_IP>` with your Windows machine IP address.

## 8. Notes

- If the backend is running locally in Docker, ensure port `8080` is exposed.
- For Windows Firewall issues, allow `Node.js` / `expo` network access.
