# User Dashboard Workflow

This document describes the workflow for the user-facing dashboard, including profile editing, address management, and page navigation.

## Route and page

- User dashboard route: `/dashboard`
- Rendered by: `frontend/src/pages/UserDashboard.jsx`
- Protected route configured in: `frontend/src/App.jsx`

## Sidebar navigation items

The dashboard sidebar includes the following sections:

- Overview
- Orders
- Wishlist
- Addresses
- Profile Information
- Payment Methods
- Saved Cards
- My Pets
- Notifications
- Help & Support
- Logout

## Dashboard data flow

1. On mount, `UserDashboard` loads data from the backend:
   - `GET /api/v1/orders`
   - `GET /api/v1/users/me`
   - `GET /api/v1/users/me/addresses`
2. The response populates component state:
   - `orders`
   - `userProfile`
   - `profileForm`
   - `addresses`
3. The selected sidebar item controls which section is rendered.

## Profile editing workflow

1. User selects `Profile Information`.
2. Form fields are populated from `profileForm` state:
   - `firstName`
   - `lastName`
   - `phone`
   - `gender`
   - `dateOfBirth`
3. User updates field values.
4. On submit, frontend sends `PUT /api/v1/users/me`.
5. Backend updates user data and returns the updated profile.
6. Frontend updates `userProfile` and shows status feedback.

## Address management workflow

1. User selects `Addresses`.
2. Existing addresses load from `addresses` state.
3. User can `Add New Address` or `Edit` an existing address.
4. Add flow:
   - Show address form
   - Send `POST /api/v1/users/me/addresses`
   - Append returned address to state
5. Edit flow:
   - Show existing address in the form
   - Send `PUT /api/v1/addresses/{id}`
   - Replace updated address in state
6. Delete flow:
   - Send `DELETE /api/v1/addresses/{id}`
   - Remove address from state

## UI interaction notes

- The dashboard displays a summary card with user initials, verification status, and contact details.
- `Overview` shows quick profile and address summaries.
- `Orders` shows recent order history with status, total, and date.
- `Help & Support` offers a contact action.
- `Logout` clears auth state and navigates the user to `/login`.

## Implementation files

- `frontend/src/pages/UserDashboard.jsx`
- `frontend/src/pages/Dashboard.css`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/App.jsx`
