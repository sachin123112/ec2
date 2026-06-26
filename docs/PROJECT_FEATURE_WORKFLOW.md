# Project Feature Workflow

This document explains how to add new features to the project, where to place code and migrations, and where to update credentials or defaults.

## Summary - key locations

- Backend auth service config: `backend-platform/services/auth-service/src/main/resources/application.yml`
- Backend API controllers: `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/` (`AuthController.java`, `ApiController.java`)
- Database migrations (Flyway): `backend-platform/services/auth-service/src/main/resources/db/migration/`
- Shared SQL migrations (repository): `database/migrations/`
- Static test UIs added: `backend-platform/services/auth-service/src/main/resources/static/login.html` and `dashboard.html`
- Frontend (React + Vite): `frontend/` (dev server: `npm run dev`)

## Default credentials (for local development)

- PostgreSQL connection (from `application.yml`):
  - Host: `localhost`
  - Port: `5432`
  - Database: `ec2_db`
  - Username: `postgres`
  - Password: `postgres`

- Application default user (Spring Boot dev user in `application.yml`):
  - Username: `dev`
  - Password: `DevPass123`

Important: These are development defaults. Do NOT use these credentials in production; secure them using environment variables or a secret manager.

## Adding a new backend feature (high level)

1. Create a feature branch: `git checkout -b feature/<name>`
2. Add or modify model/entity in `.../model/`
3. Add a Spring Data `Repository` in `.../repository/` if data persistence is required
4. Add service/business logic under `.../service/` (create package if needed)
5. Expose REST endpoints in `.../controller/` (use `@RestController` + DTOs)
6. Add DTOs in `.../dto/` and map entities to DTOs in the controller or service
7. Add Flyway migration SQL in `backend-platform/services/auth-service/src/main/resources/db/migration/` (filename must be `V{n}__description.sql`)
8. Run `mvn -f backend-platform/services/auth-service/pom.xml spring-boot:run` and verify endpoints

## Adding a new frontend feature (high level)

1. Create a feature branch: `git checkout -b feature/<name>`
2. Add UI components under `frontend/src/components/` or `frontend/src/pages/`
3. Add routes in `frontend/src/main.jsx` or `App.jsx` using `react-router-dom`
4. Call backend APIs using `fetch` or a shared HTTP client; store the API base URL in environment variables (`VITE_API_URL`)
5. Run locally: `cd frontend && npm install && npm run dev` (requires Node >= 20)

## Database migrations

- Add migration files to `backend-platform/services/auth-service/src/main/resources/db/migration/` for the service-specific DB changes. For repository-level migrations use `database/migrations/`.
- File names must follow Flyway convention: `V{version}__short_description.sql`.
- Flyway runs automatically when the auth service starts (see `application.yml`).

## Testing and QA

- Backend: run unit and integration tests with Maven: `mvn -f backend-platform/services/auth-service/pom.xml test`
- Frontend: `npm run lint` and `npm run dev` for manual QA. If Node version errors occur, upgrade Node to v20+ or use the provided `start-dev.mjs` shim (temporary).

## Notes about local development issues encountered

- Vite and some dev dependencies require Node v20+ (errors such as `node:util` missing `styleText` or `CustomEvent is not defined` indicate Node version incompatibility). Prefer installing Node v20 LTS or newer.
- Quick temporary shim included: `frontend/start-dev.mjs` — polyfills `CustomEvent` and starts Vite programmatically. This may still fail on Node versions older than v20 due to other missing Node APIs; upgrading Node is recommended.

## Contact / Ownership

- If you add a feature, update this file with: feature name, author, files changed, migration filenames, and any manual steps required to test.

Example entry:

```
Feature: Add product tags
Author: Your Name
Files:
 - backend-platform/services/auth-service/src/main/java/com/company/auth/model/ProductTag.java
 - backend-platform/services/auth-service/src/main/java/com/company/auth/repository/ProductTagRepository.java
 - backend-platform/services/auth-service/src/main/resources/db/migration/V4__create_product_tags.sql
 - frontend/src/components/ProductTags.jsx
Testing:
 - Run backend: mvn -f backend-platform/services/auth-service/pom.xml spring-boot:run
 - Run frontend: cd frontend && npm run dev
```
