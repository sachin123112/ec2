# Backend SQL & ER Diagram Workflow

This document describes the SQL schema and entity relationships for the backend database, plus the workflow for updates.

## Database schema overview

The project uses PostgreSQL and Flyway migrations for schema management. Backend-specific migrations live in:

- `backend-platform/services/auth-service/src/main/resources/db/migration/`

Shared and initial repository migrations are in:

- `database/migrations/`

## Key tables

- `users`
  - `id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `gender`, `date_of_birth`, `status`, `created_at`

- `roles`
  - `id`, `name`, `description`, `created_at`

- `user_roles`
  - `user_id`, `role_id`

- `categories`
  - `id`, `name`, `description`, `created_at`

- `products`
  - `id`, `category_id`, `name`, `description`, `sku`, `price`, `stock_quantity`, `created_at`

- `orders`
  - `id`, `user_id`, `order_number`, `total_amount`, `status`, `created_at`

- `addresses`
  - `id`, `user_id`, `label`, `name`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `phone`, `is_default`

## ER diagram

```text
 users{PK id} -----< orders{PK id}
    |                   \
    |                    >-- order_items{PK id} --< products{PK id}
    |                                          |
    >-- user_roles -- roles{PK id}             >-- categories{PK id}
    |
    >-- addresses{PK id}
```

## Address addition workflow

1. Create or update the `addresses` table via a migration.
2. Add the `Address` entity in backend model package.
3. Add `AddressRepository`.
4. Add address DTOs and request classes.
5. Expose address endpoints in the controller.
6. Use authenticated user context to scope addresses to the current user.

## Profile field workflow

1. Extend `users` table with new columns: `phone`, `gender`, `date_of_birth`.
2. Add corresponding fields to the `User` entity.
3. Add fields to `UserDto` for response mapping.
4. Add `UserUpdateRequest` to accept profile updates.
5. Update `GET /api/v1/users/me` and `PUT /api/v1/users/me` endpoints.

## Migrations

The project migration path includes:

- `V1__create_users.sql`
- `V2__create_products.sql`
- `V3__create_orders.sql`
- `V4__create_categories_and_roles.sql`
- `V5__seed_categories.sql`
- `V6__extend_user_profile_and_add_addresses.sql`

## Notes

- `addresses.user_id` references `users.id` and enforces `ON DELETE CASCADE`.
- Use new migration files when adding columns or tables rather than altering existing SQL in production.
- The backend currently uses Flyway to apply migrations automatically at startup.
