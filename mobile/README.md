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

## Additional documentation

- `TROUBLESHOOTING.md` — common Expo/Android issues on Windows.
- `MOBILE_WORKFLOW.md` — mobile app workflow and backend connectivity.
