## Database flows and ER diagram

This document describes how products, categories, orders, users and roles relate, plus flow for signup and password reset.

Entities
- `users` (id, username, email, password_hash, first_name, last_name, status)
- `roles` (id, name, description)
- `user_roles` (user_id, role_id)
- `categories` (id, name)
- `products` (id, name, description, sku, price, stock_quantity, category_id)
- `orders` (id, user_id, order_number, total_amount, status)
- `order_items` (id, order_id, product_id, quantity, unit_price)
- `reset_tokens` (id, user_id, token, expires_at, used)

Flows

- Signup
  1. Frontend calls `POST /api/v1/auth/signup` with `{ email, phone, password }`.
  2. Backend creates `users` record, hashes password, assigns default `ACTIVE` status.
  3. Backend returns JWT token.

- Forgot password
  1. Frontend calls `POST /api/v1/auth/forgot-password` with `{ email }`.
  2. Backend finds user by email. If exists, create `reset_tokens` row with expiry and send email with reset link containing token.
  3. User clicks link -> frontend collects new password and `token`, calls `POST /api/v1/auth/reset-password`.
  4. Backend verifies token, updates user's `password_hash`, marks token used.

- Categories + Products
  - Categories are created via `POST /api/v1/categories`.
  - Products reference categories via `category_id` foreign key.

ER diagram (ASCII)

    users{PK id} -----< orders{PK id}
       |                     |
       |                     >-- order_items{PK id} --< products{PK id}
       |                                             |
       >-- user_roles -- roles{PK id}                >-- categories{PK id}

Detailed SQL migrations are stored in `database/migrations` and `backend-platform/services/auth-service/src/main/resources/db/migration`.
