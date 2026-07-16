# Android Studio Setup — Pawmart Mobile (Expo)

This guide explains how to set up the mobile app for Android development on Windows with Android Studio. The mobile app in this repo uses Expo (managed workflow) — `package.json` uses Expo 50.

Prerequisites
- Node.js (16+ recommended; 18+ works). Download: https://nodejs.org/
- Git
- Android Studio (latest stable) — includes Android SDK and AVD manager
- Windows: enable virtualization in BIOS if you want to run emulators

1) Install Node and Yarn (optional)

```powershell
# Verify Node is installed
node -v
npm -v
# Optional: install yarn
npm install -g yarn
```

2) Install Android Studio
- Download and install Android Studio from https://developer.android.com/studio
- During installation, allow Android Studio to install the Android SDK, Android SDK Platform-Tools and Android SDK Build-Tools.
- Open Android Studio → SDK Manager and install:
  - Android SDK Platform (API level 33 or 34 recommended)
  - Android SDK Platform-Tools
  - Android SDK Build-Tools
  - Android Emulator
  - Android SDK Command-line Tools

3) Configure environment variables (Windows)
- Open System Properties → Advanced → Environment Variables
- Add or set:
  - `ANDROID_HOME` = C:\Users\<YourUser>\AppData\Local\Android\Sdk
  - `ANDROID_SDK_ROOT` = C:\Users\<YourUser>\AppData\Local\Android\Sdk
- Add to `Path` (User or System):
  - %ANDROID_SDK_ROOT%\platform-tools
  - %ANDROID_SDK_ROOT%\emulator
  - %ANDROID_SDK_ROOT%\tools\bin (if present)

4) Start an Android Virtual Device (AVD)
- Open Android Studio → AVD Manager → Create Virtual Device → pick a device and a system image (recommend x86_64 image for performance)
- Start the AVD

5) Install Expo CLI (optional) — you can use `npx` instead

```powershell
npm install -g expo-cli
# or use npx expo
```

6) Install app dependencies

```powershell
cd f:\ec2\mobile
npm install
# or
yarn
```

7) Run the app on Android emulator or device

- Using Expo (recommended for this project):

```powershell
# Start Metro/Expo dev server
npm run start
# To start Android emulator automatically:
npm run android
# or using expo directly:
expo start
# then press 'a' in the terminal to open Android
```

- If you prefer to run via `expo run:android` (prebuild first):

```powershell
# Create native android project files (expo prebuild)
expo prebuild
# Build and install on connected device / emulator
expo run:android
```

8) Using a physical device
- Enable developer options and USB debugging on your Android device
- Connect via USB (or via adb over network)
- Verify with `adb devices`
- Run `npm run android` or `expo start` + press `a`

9) Troubleshooting
- If `adb` not found: ensure `%ANDROID_SDK_ROOT%\platform-tools` is on `Path` and restart terminal
- Emulator not starting or extremely slow: enable virtualization (HAXM or Windows Hypervisor Platform) and use x86_64 system images
- Port conflicts: Metro uses 19000/19001; stop other processes that may occupy those ports
- If build fails after `expo prebuild`: open the generated `android` folder in Android Studio, sync Gradle and accept SDK licenses

10) Optional: Running from Android Studio
- For native debugging or profiling, prebuild the project:

```powershell
cd mobile
expo prebuild
```

- Open Android Studio → Open an existing project → select `mobile/android`
- Let Gradle sync, then run the app using the Run button or an AVD

11) CI / Release notes
- Consider using EAS (Expo Application Services) for cloud builds and production release: https://docs.expo.dev/eas/

12) Helpful commands

```powershell
# Start dev server (Metro)
npm run start
# Start on Android emulator
npm run android
# Build native Android locally (after prebuild)
expo run:android
# Check connected devices
adb devices
```

If you want, I can also:
- Add an `ANDROID_SETUP_WINDOWS.md` with screenshots
- Add shell/powershell scripts to set environment variables automatically
- Add CI steps to run `expo prebuild` and fetch the generated `v3/api-docs` for mobile (if you later generate OpenAPI for mobile) 
