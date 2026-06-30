# Frontend API Reference

This document describes the frontend API integration for the React dashboard and profile pages.

## API base path

- Frontend uses `VITE_API_URL` from environment config.
- Default fallback: `http://localhost:8080/api/v1`

## Authentication integration

- Login and signup use the auth service endpoints.
- Access token is stored in `Frontend/src/context/AuthContext.jsx` and passed as `Authorization: Bearer <token>`.

## User dashboard API calls

### Load dashboard data

- `GET /api/v1/orders`
  - Used by `frontend/src/pages/UserDashboard.jsx`
  - Loads order history for display.

- `GET /api/v1/users/me`
  - Used to load the authenticated user's profile.
  - Populates user profile form values.

- `GET /api/v1/users/me/addresses`
  - Loads saved addresses for the current user.

### Save profile

- `PUT /api/v1/users/me`
  - Used by the profile form in `frontend/src/pages/UserDashboard.jsx`
  - Sends `{ firstName, lastName, phone, gender, dateOfBirth }`
  - Updates the dashboard profile state after success.

### Save address

- `POST /api/v1/users/me/addresses`
  - Used to add a new address.
  - Sends request body with address fields.

- `PUT /api/v1/addresses/{id}`
  - Used to edit an existing address.
  - Sends the same address payload to update.

- `DELETE /api/v1/addresses/{id}`
  - Used to remove an address.

## Components and files

- Main profile page: `frontend/src/pages/UserDashboard.jsx`
- Shared styles: `frontend/src/pages/Dashboard.css`
- Auth state and token management: `frontend/src/context/AuthContext.jsx`
- Route registration: `frontend/src/App.jsx`

## Notes

- API calls include `Content-Type: application/json` and auth headers derived from the current token.
- The save/update flows use optimistic state updates after successful responses.
- If no saved address exists, the default summary view displays placeholder text.
