# iOS Quick Start for MacBook + Xcode

This is the fastest setup for developers already using a MacBook with Xcode installed.

## 1) Open terminal

```bash
cd mobile
```

## 2) Install dependencies

```bash
npm install
```

If the iOS native dependencies are not installed yet:

```bash
npx pod-install
```

## 3) Start the app

```bash
npx expo start
```

Then:

- press `i` to open the iOS simulator, or
- run:

```bash
npx expo run:ios
```

## 4) Common commands

```bash
npm install
npx expo start
npx expo run:ios
```

## 5) Notes

- This app is configured for Expo iOS in [mobile/app.json](app.json).
- Bundle identifier: `com.pawmart.mobile`
- This setup assumes you are on macOS with Xcode installed.

## 6) If the simulator does not open

```bash
xcode-select --install
```

Then confirm the simulator runtime is installed in Xcode:

- Xcode > Settings > Platforms

## 7) If pods fail

```bash
cd ios
pod install --repo-update
```

## 8) Usually enough

For most MacBook developers, this is enough to run the app locally on iOS without extra setup.
