# Swagger / OpenAPI

This service exposes OpenAPI documentation in two ways:

- Dynamic (recommended): `springdoc-openapi` generates OpenAPI at runtime.
  - Swagger UI: http://localhost:8080/swagger-ui/index.html
  - Admin UI alias: http://localhost:8080/swagger-admin.html
  - Mobile UI alias: http://localhost:8080/swagger-mobile.html
  - Raw OpenAPI JSON: http://localhost:8080/v3/api-docs
  - Admin OpenAPI JSON: http://localhost:8080/v3/api-docs/admin
  - Mobile OpenAPI JSON: http://localhost:8080/v3/api-docs/mobile

- Static snapshots (kept for reference):
  - Static YAML files: `/static/docs/swagger-admin.yaml` and `/static/docs/swagger-mobile.yaml`

Authentication (JWT) in Swagger UI

1. Obtain a JWT access token from the `/api/v1/auth/login` endpoint (or your auth flow).
2. In the Swagger UI, click `Authorize` (top-right), enter the value:

   Bearer <YOUR_ACCESS_TOKEN>

   Example:

   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiVVNFIl19._signature

3. After authorizing, requests that require authentication will include the `Authorization` header.

Notes
- The dynamic UI (springdoc) reflects controller annotations and DTOs; prefer it for development.
- Static YAML/HTML are snapshots and can be removed if you wish; they are kept as backups for now.

If you want, I can:
- Remove the static snapshot files, or
- Add more detailed examples for specific operations, or
- Add groupings/tags to the generated OpenAPI via annotations.
