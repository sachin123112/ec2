# PawMart Mobile App Workflow and Connectivity

This file describes the mobile app workflow and backend connectivity for PawMart.

## App workflow

### 1. User authentication

- Mobile user signs in through `LoginScreen`.
- The app calls `/api/v1/auth/login`.
- The backend returns:
  - `accessToken`
  - `roles`
  - `refreshToken`
- The app stores these values in `AsyncStorage`.

### 2. User navigation

- After login, regular users go to `Home`.
- Admin users are routed to `AdminDashboard`.
- `Home` links to `Shop`, `Cart`, and (if admin) `Admin Dashboard`.

### 3. Product browsing

- `ShopScreen` loads products from the backend via `/api/v1/products`.
- If backend fetch fails, it falls back to the local static catalog.
- Users can search and add items to cart.

### 4. Cart management

- `CartScreen` uses `CartContext` to add, update, remove, and clear items.
- Totals are computed from the cart state.

### 5. Admin dashboard

- Admin users can access `AdminDashboardScreen`.
- The app fetches `/api/v1/admin/dashboard` using the stored JWT.
- The backend returns totals for users, orders, and revenue.

## Connectivity details

### API base URL

Mobile uses `mobile/src/api/config.js` to select the backend host:

- Android emulator: `http://10.0.2.2:8080/api/v1`
- iOS simulator: `http://localhost:8080/api/v1`

For physical devices, replace the host with your PC IP address.

### Stored credentials

Auth state is persisted in `AsyncStorage`:

- access token
- user email
- roles
- refresh token

### Auth flow

- `LoginScreen` calls `auth.login`.
- The app stores tokens and roles.
- Screens can use `useAuth()` to check `isAuthenticated` and `isAdmin`.

## File structure

- `App.js` — app entry and providers
- `src/navigation/AppNavigator.js` — screen routing
- `src/context/AuthContext.js` — auth persistence and refresh logic
- `src/context/CartContext.js` — cart state management
- `src/api/config.js` — backend URL selection
- `src/api/auth.js` — auth API wrappers
- `src/api/products.js` — product API wrapper
- `src/screens/` — login, signup, home, shop, cart, dashboards
- `src/data/products.js` — fallback sample product catalog

## Running the mobile app

```powershell
cd mobile
npm install
npm run start
npm run android
```

If using a physical device, update `mobile/src/api/config.js` with the host IP.

## Notes

- Backend must be running on port `8080`.
- For Windows emulator networking, `10.0.2.2` maps to the host machine.
- Keep `mobile/README.md` and `WINDOWS_SETUP.md` for setup and troubleshooting.
