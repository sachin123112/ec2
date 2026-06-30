# Backend API Reference

This document describes the backend API endpoints, request paths, and implementation locations for the auth-service.

## API base path

- `http://localhost:8080/api/v1`

## Authentication endpoints

- `POST /api/v1/auth/login`
  - Request body: `{ "email": string, "password": string }`
  - Returns: `{ accessToken, roles, refreshToken }`

- `POST /api/v1/auth/signup`
  - Request body: `{ "email": string, "password": string, "firstName": string, "lastName": string }`
  - Returns: `{ accessToken, roles, refreshToken }`

- `POST /api/v1/auth/forgot-password`
  - Request body: `{ "email": string }`
  - Returns: `200 OK`

- `POST /api/v1/auth/reset-password`
  - Request body: `{ "token": string, "newPassword": string }`
  - Returns: `200 OK`

- `POST /api/v1/auth/refresh`
  - Request body: `{ "refreshToken": string }`
  - Returns: new access token and refresh token

## User profile endpoints

- `GET /api/v1/users/me`
  - Returns the authenticated user's profile.
  - Implemented in: `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/ApiController.java`

- `PUT /api/v1/users/me`
  - Request body: `{ "firstName", "lastName", "phone", "gender", "dateOfBirth" }`
  - Updates the authenticated user's profile data.

## Address management endpoints

- `GET /api/v1/users/me/addresses`
  - Returns saved addresses for the authenticated user.

- `POST /api/v1/users/me/addresses`
  - Request body: `{ "label", "name", "addressLine1", "addressLine2", "city", "state", "postalCode", "country", "phone", "isDefault" }`
  - Creates a new address for the authenticated user.

- `PUT /api/v1/addresses/{id}`
  - Request body: same as add address
  - Updates an existing address owned by the authenticated user.

- `DELETE /api/v1/addresses/{id}`
  - Deletes an address owned by the authenticated user.

## Product endpoints

- `GET /api/v1/products`
  - Returns product list.

- `POST /api/v1/products`
  - Request body: `{ "name", "description", "sku", "price", "stockQuantity", "categoryId" }`
  - Requires ADMIN role.

- `DELETE /api/v1/products/{id}`
  - Deletes a product.

## Category endpoints

- `GET /api/v1/categories`
  - Returns category list.

- `POST /api/v1/categories`
  - Request body: `{ "name" }`
  - Creates a category.

- `DELETE /api/v1/categories/{id}`
  - Deletes a category.

## Role endpoints

- `GET /api/v1/roles`
  - Returns role list.

- `POST /api/v1/roles`
  - Request body: `{ "name", "description" }`

- `DELETE /api/v1/roles/{id}`
  - Deletes a role.

## Order endpoints

- `GET /api/v1/orders`
  - Returns orders for authenticated users.

- `POST /api/v1/orders`
  - Request body: `{ "userId", "totalAmount", "status" }`

- `DELETE /api/v1/orders/{id}`
  - Deletes an order.

## Implementation paths

- Controllers: `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/ApiController.java`
- User model: `backend-platform/services/auth-service/src/main/java/com/company/auth/model/User.java`
- Address model: `backend-platform/services/auth-service/src/main/java/com/company/auth/model/Address.java`
- DTOs: `backend-platform/services/auth-service/src/main/java/com/company/auth/dto/`
- Repositories: `backend-platform/services/auth-service/src/main/java/com/company/auth/repository/`
- Migrations: `backend-platform/services/auth-service/src/main/resources/db/migration/`

## Notes

- All authenticated endpoints require a valid `Authorization: Bearer <token>` header.
- Admin-only endpoints are protected by Spring Security roles.
