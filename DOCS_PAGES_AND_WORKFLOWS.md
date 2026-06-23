# Pages, Code Overview and CI/CD Workflows

This document explains the frontend pages and components, backend services and endpoints, database migrations, and the CI/CD workflows (what they do and how they run).

---

## Frontend (React + Vite)

Location: `frontend/`

### Pages
- `frontend/src/pages/Home.jsx`
  - Purpose: Landing page, hero section, highlights and navigation to shop.
  - Key responsibilities: display hero, featured products, link to `Shop`.

- `frontend/src/pages/Shop.jsx`
  - Purpose: Product listing and filters.
  - Key responsibilities: fetch products from API or local `products.js`, render list, add-to-cart actions.

- `frontend/src/pages/Cart.jsx`
  - Purpose: Show items added to cart, allow quantity changes and checkout action.
  - Key responsibilities: read/write `CartContext`, compute totals, send checkout request.

### Components
- `frontend/src/components/Navbar.jsx`
  - Provides navigation links to `Home`, `Shop`, and `Cart` with a cart count badge.

- `frontend/src/components/Footer.jsx`
  - Site footer with copyright and links.

### Context
- `frontend/src/context/CartContext.jsx`
  - Holds cart state (items, quantities) and exposes actions: `addItem`, `removeItem`, `clearCart`.

### Data
- `frontend/src/data/products.js`
  - Local product fixtures used in development.

### How routing works
- `react-router-dom` is used in `main.jsx`/`App.jsx` to map routes:
  - `/` → `Home`
  - `/shop` → `Shop`
  - `/cart` → `Cart`

### Run locally
```bash
cd frontend
npm install
npm run dev        # dev server
npm run build      # production build -> dist/
npm run preview    # preview production build
```

---

## Backend Services (Spring Boot)

Location: `backend-platform/services/`

There are three microservices (each under `services/`):
- `auth-service`
- `user-service`
- `order-service`

Each service is a Spring Boot application with its own `pom.xml` and `application.yml`.

### Auth Service (examples)
- Main controller: `AuthController` (path: `src/main/java/com/company/auth/controller/AuthController.java`)
- Example endpoint:
  - `POST /api/v1/auth/login` — accepts a JSON `LoginRequest` and returns a JWT in `AuthResponse`.
  - `LoginRequest` has `email` and `password` fields with getters/setters.

### User Service
- Responsible for user management (CRUD users, profile updates).
- Typical endpoints:
  - `GET /api/v1/users/{id}`
  - `POST /api/v1/users` (create)

### Order Service
- Responsible for orders lifecycle (create order, list orders for user, update status).
- Typical endpoints:
  - `POST /api/v1/orders` (create)
  - `GET /api/v1/orders?userId={id}`

### Database & Migrations
- PostgreSQL is used as the primary relational DB.
- Flyway is configured centrally under `backend-platform/src/main/resources/db/migration/` and runs migrations in CI and at runtime when configured.
  - Migrations: `V1__create_users.sql`, `V2__create_products.sql`, `V3__create_orders.sql`.

- `auth-service` `application.yml` is configured to point at the DB and enable Flyway if you run migrations per-service (but migrations are centralized to `backend-platform`).

### Run backend locally
1. Ensure PostgreSQL is running and `ec2_db` exists.
2. From repo root:
```bash
# Build all services
cd backend-platform
mvn clean package -DskipTests

# Run single service (auth)
cd services/auth-service
mvn spring-boot:run
```

Flyway will run (if configured) when the application starts and create tables.

---

## Centralized Flyway Migrations
- Migrations live in: `backend-platform/src/main/resources/db/migration/`
- CI runs the Flyway Maven plugin before building the backend to ensure the DB schema is up-to-date.
- The `backend-platform/pom.xml` contains a `flyway-maven-plugin` declaration with the PostgreSQL driver added to the plugin classpath so the plugin can instantiate `org.postgresql.Driver` during GitHub Actions runs.

---

## CI/CD Workflows

### Backend: `.github/workflows/backend-ci.yml`
Triggers:
- `push` and `pull_request` on `main` for `services/**` and `backend-platform/**` changes.

Key steps (summary):
1. Checkout code
2. Set up JDK 17
3. Start a Postgres 16 service in the job (Docker service)
4. Wait for Postgres to be ready
5. Run Flyway migrations centrally via Maven:
   ```bash
   mvn org.flywaydb:flyway-maven-plugin:9.16.0:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db -Dflyway.user=postgres -Dflyway.password=postgres123
   ```
6. Build `backend-platform` and individual services (`mvn clean package -DskipTests`)
7. Run tests (`mvn test`)
8. Upload artifacts

Notes:
- The Flyway plugin must have the PostgreSQL JDBC driver on the plugin classpath (we added this in `backend-platform/pom.xml`).

### Frontend: `.github/workflows/frontend-ci-cd.yml`
Triggers:
- `push` and `pull_request` on `main` for `frontend/**` changes.

Key steps (summary):
1. Checkout code
2. Set up Node.js (Node 24 recommended)
3. Install dependencies (`npm ci`)
4. Run linting (optional, continues on error)
5. Build the frontend (`npm run build`) producing `frontend/dist`
6. Upload artifact
7. Configure GitHub Pages and deploy using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` (workflow contains `enablement: true` to auto-enable Pages)

Notes:
- Pages requires repo visibility or appropriate account type; ensure GitHub Pages is enabled and configured to use GitHub Actions in repository settings.

---

## How workflows interact with code and DB
- CI starts Postgres for the duration of the job and runs migrations before building code, ensuring that integration tests have the expected schema.
- Migrations are the single source of truth; services should not contain duplicate migrations.

---

## Where to look when something fails
- GitHub Actions UI: https://github.com/sachin123112/ec2/actions
- Backend logs: uploaded artifacts (if any) and job logs in the Actions run
- Flyway errors often indicate missing JDBC driver or DB unreachable — the CI config includes plugin dependency and a `postgres` service.

---

## Suggested next improvements
- Add integration tests that exercise endpoints against the CI Postgres instance.
- Add a `flyway` run step in a separate job that gates deployment (fail fast if migrations fail).
- Add environment-specific application configuration (profiles) for `dev` and `ci`.

---

## Quick reference commands
Build backend and run migrations locally (with Docker Postgres):
```bash
# start Postgres container
docker run -d --name postgres_ec2 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=ec2_db -p 5432:5432 postgres:16

# run centralized Flyway migrations from backend-platform
cd backend-platform
mvn org.flywaydb:flyway-maven-plugin:9.16.0:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db -Dflyway.user=postgres -Dflyway.password=postgres123

# build
mvn clean package -DskipTests
```

Frontend quick start:
```bash
cd frontend
npm ci
npm run dev
```

---

If you want, I can now:
- Generate per-file comments for every source file (detailed code walkthrough), or
- Run a local CI-style build here (start Postgres container and run Maven migrate/build) to verify migrations—pick one.

