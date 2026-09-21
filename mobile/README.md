# PawMart Mobile

A cross-platform React Native mobile app scaffold for iOS and Android.

## Setup

1. Open a terminal in `mobile/`
2. Install dependencies:

```bash
cd mobile
npm install
```

3. Start Expo:

```bash
npm run start
```

4. Run on a simulator or physical device:

```bash
npm run ios
npm run android
```

## Notes

- The mobile app connects to `http://localhost:8080/api/v1` for iOS and `http://10.0.2.2:8080/api/v1` for Android emulators by default.
- For a physical device, set `EXPO_PUBLIC_API_URL` to the backend URL reachable from that device, for example `EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api/v1 npx expo start -c`.
- Admin users are routed to the `Admin Dashboard` from the mobile login flow.

## Windows setup

For Windows-specific Expo and Android setup, see `WINDOWS_SETUP.md`.

## iOS builds without a local Mac (Expo + EAS)

This project is configured for Expo Application Services (EAS) so you can prepare iOS builds from Windows without needing a local Mac machine.

### 1) Install EAS CLI

```bash
npm install -g eas-cli
```

### 2) Log in to Expo

```bash
eas login
```

### 3) Configure the project

From the `mobile/` folder:

```bash
cd mobile
eas build:configure
```

This project already includes an EAS config in `eas.json`.

### 4) Build for iOS in the cloud

```bash
cd mobile
eas build --platform ios --profile preview
```

Or for production:

```bash
cd mobile
eas build --platform ios --profile production
```

### 5) EAS setup checklist

Use this checklist before your first iOS cloud build:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in to Expo:

```bash
eas login
```

3. Open the Expo dashboard in your browser and confirm the project is linked to your Expo account.

4. Sign in to Apple Developer and create an Apple Developer account if needed.

5. In the Expo dashboard, go to your project and configure Apple credentials:
   - Apple account
   - App Store Connect access
   - iOS signing credentials

6. Run:

```bash
cd mobile
eas build:configure
```

7. Start the iOS build:

```bash
cd mobile
eas build --platform ios --profile preview
```

8. If you need a real App Store / TestFlight build, complete the Apple signing flow in EAS and then run:

```bash
cd mobile
eas build --platform ios --profile production
```

### 6) Prerequisites for Apple signing

For a real App Store or TestFlight build, you will still need:

- an Apple Developer account
- an Apple signing certificate
- App Store Connect access
- EAS credentials set up for the app

### Notes

- EAS builds run on Apple infrastructure in the cloud, so no local Mac is required for build generation.
- You can still use the simulator locally only on macOS with Xcode.
- For development testing on Windows, use the Android emulator or Expo Go on a physical device.

### One-command setup for a new Windows machine

Run these commands in order from a terminal:

```bash
cd mobile
npm install
npm install -g eas-cli
eas login
cd mobile
eas build:configure
eas build --platform ios --profile preview
```

If you are ready for a production Apple build, use:

```bash
cd mobile
eas build --platform ios --profile production
```

You can also run the helper script included with the project:

```powershell
cd mobile
./setup-ios-eas.ps1
```

> You still need an Apple Developer account and EAS Apple credentials for the final production build, but the machine itself does not need a local Mac.

## Additional documentation

- `TROUBLESHOOTING.md` — common Expo/Android issues on Windows.
- `MOBILE_WORKFLOW.md` — mobile app workflow and backend connectivity.
- `IOS_SETUP.md` — general iOS setup information.
- `IOS_SETUP_MACBOOK_QUICKSTART.md` — one-page MacBook quick start.
