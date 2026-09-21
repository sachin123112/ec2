# iOS Setup Guide for PawMart Mobile

This project is an Expo React Native app configured for iOS in [mobile/app.json](app.json). The steps below are tailored to this app and use the standard Expo workflow for local iOS development.

## Quick Start

If you already have Xcode and Node installed, this is the fastest path:

```bash
cd mobile
npm install
npx expo start
```

Then in the Expo terminal:

- press `i` to open the iOS simulator, or
- run:

```bash
npx expo run:ios
```

This app is already configured with an iOS bundle identifier:

- `com.pawmart.mobile`

## Requirements

For a real iOS build or simulator run, you need:

- Node.js 18+
- npm
- Expo SDK 50
- Xcode 15+
- iOS Simulator
- CocoaPods
- macOS computer

## macOS install steps

1. Install Xcode from the App Store.
2. Open Xcode and accept the license.
3. Install Command Line Tools:

```bash
xcode-select --install
```

4. Install CocoaPods:

```bash
sudo gem install cocoapods
```

## Install app dependencies

From the mobile folder:

```bash
cd mobile
npm install
```

If the app needs native iOS pods installed:

```bash
cd mobile
npx pod-install
```

## Run the app on iPhone/iOS simulator

### Option 1: Expo development workflow

```bash
cd mobile
npx expo start
```

Then press `i` in the terminal or choose the iOS simulator from the Expo UI.

### Option 2: Direct iOS build run

```bash
cd mobile
npx expo run:ios
```

This builds the native iOS app and launches it in the simulator.

## Important app-specific notes

This project already includes iOS support in [mobile/app.json](app.json), including:

- `platforms: ["ios", "android", "web"]`
- `ios.bundleIdentifier: "com.pawmart.mobile"`
- Expo SDK version `50.0.0`

The app also uses safe-area-aware navigation and iOS-friendly layout adjustments in the mobile codebase.

## Troubleshooting

### CocoaPods error

```bash
sudo gem install cocoapods
```

### Xcode tools missing

```bash
xcode-select --install
```

### Simulator not appearing

Open Xcode and verify the iOS simulator runtime is installed under Xcode > Settings > Platforms.

### Native build issues

Run:

```bash
cd mobile
rm -rf ios/Pods ios/Podfile.lock
npx pod-install
```

## For production / App Store

To publish iOS builds:

1. Create an Apple Developer account
2. Set up signing in Xcode
3. Keep the bundle identifier as `com.pawmart.mobile`
4. Use Xcode or EAS Build for distribution

## Useful commands

```bash
cd mobile
npm install
npx expo start
npx expo run:ios
npx expo install
```

## Important limitation

Because this is an iOS app, the simulator can only run on macOS. If you are on Windows, you can still work on the code, but you cannot launch the iOS simulator locally without a Mac machine or a remote Mac build environment.
