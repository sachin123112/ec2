# Backend API Contracts for Categories, Roles, Auth Flows

This document describes minimal endpoints the frontend expects. Implement these in the auth-service (or a new admin-service).

Auth
- POST /api/v1/auth/signup
  - body: { email, phone, password }
  - response: { accessToken }

- POST /api/v1/auth/forgot-password
  - body: { email }
  - response: 200 on success (send email with reset link)

Categories
- GET /api/v1/categories
  - response: [{ id, name }]

- POST /api/v1/categories
  - protected (requires Authorization: Bearer token)
  - body: { name }
  - response: created category

Roles
- GET /api/v1/roles
  - response: [{ id, name, description }]

- POST /api/v1/roles
  - protected
  - body: { name, description }

Notes
- Products should include `category_id` (or `category` object) when persisted.
- Orders and products must return proper IDs when created; migrations added in `database/migrations` to persist categories and roles.
