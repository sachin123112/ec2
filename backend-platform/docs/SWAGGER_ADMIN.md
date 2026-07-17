# Admin Panel Swagger

The Admin Panel API documentation is available when the auth service is running.

## Swagger UI

Open [http://localhost:8080/swagger-admin.html](http://localhost:8080/swagger-admin.html) to launch the Admin Swagger UI.

## OpenAPI JSON

The Admin Panel OpenAPI specification is available at:

`http://localhost:8080/v3/api-docs/admin`

## Included APIs

- Admin dashboard and analytics
- User and role management
- Product and category management
- Order management
- Link management

## Authorization

Most admin endpoints require an administrator JWT. In Swagger UI, select **Authorize** and enter the access token as a bearer token.

