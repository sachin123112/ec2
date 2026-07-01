# PawMart Mobile Troubleshooting

This file covers common Expo and Android emulator issues on Windows.

## 1. Expo CLI not found

If `expo` is not recognized, ensure it is installed globally:

```powershell
npm install -g expo-cli
```

Then restart your terminal.

## 2. Android emulator does not start

- Open Android Studio > AVD Manager.
- Ensure the virtual device is created and the image is installed.
- Use `npm run android` from the `mobile` folder.

If it still fails, run:

```powershell
adb devices
```

If no devices appear, restart the emulator and try again.

## 3. App cannot connect to backend

On Windows, Android emulators use `10.0.2.2` to reach the host machine.

- Android: `http://10.0.2.2:8080/api/v1`
- iOS: `http://localhost:8080/api/v1`

If using a physical device, replace the API host in `mobile/src/api/config.js` with your PC IP address:

```js
const API_URL = 'http://192.168.1.100:8080/api/v1';
```

## 4. Firewall blocks requests

Allow Node.js and the emulator through Windows Defender Firewall.

## 5. Metro bundler hangs or fails

- Close the terminal and restart Expo.
- Clear the Expo cache:

```powershell
expo start -c
```

## 6. Unable to install npm dependencies

Delete `node_modules` and `package-lock.json`, then reinstall:

```powershell
cd mobile
rm -r node_modules
rm package-lock.json
npm install
```

If using PowerShell, `rm -r` may be `Remove-Item -Recurse node_modules`.

## 7. App shows old code after changes

Restart Expo and clear cache:

```powershell
npm run start -- --clear
```

## 8. Android emulator networking issues

- Ensure the emulator can browse the web.
- If not, reboot the emulator or switch to a different AVD image.
- Confirm the backend is running and accessible on port `8080`.
