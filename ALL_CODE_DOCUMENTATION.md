# Complete Codebase Documentation

This document lists the repository files (frontend and backend), provides a short explanation for each source file, and includes the full contents of dependency files and CI workflow files.

Generated: 2026-06-23

---

## Table of Contents

- Frontend files
- Mobile files
- Backend files
- Dependency files (full contents)
- CI/CD workflow files (full contents)

---

## Frontend (frontend/)

Files and purpose:

- `frontend/index.html` — App entry HTML with root element and Vite script.
- `frontend/package.json` — Node/npm metadata and scripts (full contents in Dependency files section).
- `frontend/package-lock.json` — Lockfile for exact dependency versions.
- `frontend/vite.config.js` — Vite configuration (plugins, server options).
- `frontend/pom.xml` — (Present but not used by frontend JS; possibly for integration or GitHub Pages tooling.)
- `frontend/public/favicon.svg` — Favicon asset.
- `frontend/public/icons.svg` — Icon sprite.

Source files under `frontend/src/`:

- `frontend/src/main.jsx` — React entry; renders `<App />` into `#root`.
- `frontend/src/App.jsx` — Application router and layout (wraps routes with `CartProvider`, shows `Navbar`, `Footer`).
- `frontend/src/index.css` — Global CSS for the app.
- `frontend/src/App.css` — Component CSS for the app layout.

Components:
- `frontend/src/components/Navbar.jsx` — Top navigation bar, search, category links, cart badge.
- `frontend/src/components/Navbar.css` — Styles for the `Navbar`.
- `frontend/src/components/Footer.jsx` — Footer component with brand and links.
- `frontend/src/components/Footer.css` — Styles for the `Footer`.

Context and data:
- `frontend/src/context/CartContext.jsx` — React context managing cart state and actions (add, remove, update quantity, clear). Exposes `totalItems` and `totalPrice`.
- `frontend/src/data/products.js` — Local product fixture data used by `Shop` during development.

Pages:
- `frontend/src/pages/Home.jsx` — Landing page with hero and featured products.
- `frontend/src/pages/Home.css` — Styles for `Home`.
- `frontend/src/pages/Shop.jsx` — Product listing page; supports search and category query parameters.
- `frontend/src/pages/Shop.css` — Styles for `Shop`.
- `frontend/src/pages/Cart.jsx` — Shopping cart page displaying cart items and checkout action.
- `frontend/src/pages/Cart.css` — Styles for `Cart`.

Assets:
- `frontend/src/assets/hero.png` — Hero image for the home page.
- `frontend/src/assets/react.svg` — React logo used in the template.
- `frontend/src/assets/vite.svg` — Vite logo used in the template.

How to run frontend locally:

```bash
cd frontend
npm ci
npm run dev      # start Vite dev server on port 5173
npm run build    # produce production build in frontend/dist
npm run preview  # preview production build
```

---

## Mobile (mobile/)

Files and purpose:

- `mobile/package.json` — Expo app metadata, dependencies, and scripts.
- `mobile/app.json` — Expo configuration for the mobile app.
- `mobile/babel.config.js` — Babel preset for Expo.
- `mobile/App.js` — React Native entry point; wraps navigation and providers.
- `mobile/README.md` — Mobile setup instructions and links to Windows-specific docs.
- `mobile/WINDOWS_SETUP.md` — Windows-specific Expo and Android emulator setup guide.
- `mobile/TROUBLESHOOTING.md` — Common Expo and Android emulator troubleshooting on Windows.
- `mobile/MOBILE_WORKFLOW.md` — Mobile app workflow and backend connectivity documentation.

Source files under `mobile/src/`:

- `mobile/src/api/config.js` — Selects the backend API URL for Android emulator vs iOS.
- `mobile/src/api/auth.js` — Auth API wrappers for login, signup, and refresh.
- `mobile/src/api/products.js` — Product listing API wrapper.
- `mobile/src/context/AuthContext.js` — Auth persistence and refresh logic using AsyncStorage.
- `mobile/src/context/CartContext.js` — Cart state management and actions.
- `mobile/src/navigation/AppNavigator.js` — Navigation stack for screens.
- `mobile/src/screens/LoginScreen.js` — Login UI and auth flow.
- `mobile/src/screens/SignupScreen.js` — Signup UI and auth flow.
- `mobile/src/screens/HomeScreen.js` — Landing screen with shop and cart navigation.
- `mobile/src/screens/ShopScreen.js` — Product browsing screen with search and add-to-cart.
- `mobile/src/screens/CartScreen.js` — Cart review and quantity management screen.
- `mobile/src/screens/DashboardScreen.js` — Admin dashboard screen using backend admin API.
- `mobile/src/screens/AdminDashboardScreen.js` — Admin analytics screen.
- `mobile/src/data/products.js` — Fallback product catalog used when the backend is unavailable.

How to run mobile locally:

```bash
cd mobile
npm install
npm run start
npm run android
```

---

## Backend (backend-platform/)

Top-level files:
- `backend-platform/pom.xml` — Parent Maven POM for the multi-module backend platform (contains properties, modules, and added Flyway plugin).
- `backend-platform/src/main/resources/db/migration/` — Centralized Flyway migration SQL files:
  - `V1__create_users.sql` — users table and indexes
  - `V2__create_products.sql` — products table and indexes
  - `V3__create_orders.sql` — orders and order_items tables and indexes

Kubernetes and infra descriptors:
- `backend-platform/ingress/ingress.yaml` — Ingress configuration for Kubernetes.
- `backend-platform/postgres/*` — Kubernetes manifests for PostgreSQL.
- `backend-platform/redis/*` — Kubernetes manifests for Redis.
- `backend-platform/docker-compose.yml` — Docker compose for local multi-service orchestration.

Service modules (Maven modules under `backend-platform/services/`):

### `auth-service`
- `backend-platform/services/auth-service/pom.xml` — POM for auth-service. Contains dependencies: Spring Boot web, security, jjwt, JPA, Flyway, PostgreSQL driver.
- `backend-platform/services/auth-service/src/main/java/com/company/auth/AuthServiceApplication.java` — Spring Boot main application class.
- `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/AuthController.java` — Controller exposing `/api/v1/auth` endpoints (login endpoint exists).
- `backend-platform/services/auth-service/src/main/java/com/company/auth/dto/LoginRequest.java` — DTO for login payload (email + password).
- `backend-platform/services/auth-service/src/main/java/com/company/auth/dto/AuthResponse.java` — DTO for login response (token).
- `backend-platform/services/auth-service/src/main/java/com/company/auth/security/JwtService.java` — JWT generation/validation utilities.
- `backend-platform/services/auth-service/src/main/java/com/company/auth/security/JwtAuthenticationFilter.java` — Security filter for JWT auth.
- `backend-platform/services/auth-service/src/main/resources/application.yml` — Service configuration (datasource, JPA, Flyway enabled). See Dependency files section for content.
- `backend-platform/services/auth-service/Dockerfile` — Dockerfile to build auth-service container.

### `user-service`
- `backend-platform/services/user-service/pom.xml` — POM for user-service (contains Spring Boot web, data-jpa, PostgreSQL, Flyway, test dependencies).
- `backend-platform/services/user-service/src/main/java/com/company/user/UserServiceApplication.java` — Spring Boot main class.
- `backend-platform/services/user-service/src/main/resources/application.yml` — Service configuration.
- `backend-platform/services/user-service/Dockerfile` — Dockerfile for user-service.

### `order-service`
- `backend-platform/services/order-service/pom.xml` — POM for order-service (similar dependencies to user-service).
- `backend-platform/services/order-service/src/main/java/com/company/order/OrderServiceApplication.java` — Spring Boot main class.
- `backend-platform/services/order-service/src/main/resources/application.yml` — Service configuration.
- `backend-platform/services/order-service/Dockerfile` — Dockerfile for order-service.

How migrations are applied:
- Centralized Flyway migrations are defined under `backend-platform/src/main/resources/db/migration/` and are run in CI via the Flyway Maven plugin.
- In production deployments you can either run migrations as a separate job or configure a single service to run migrations at startup.

How to run backend locally (with Docker Postgres):

```bash
# Start Postgres
docker run -d --name postgres_ec2 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=ec2_db -p 5432:5432 postgres:16

# Run Flyway migrations from backend-platform
cd backend-platform
mvn org.flywaydb:flyway-maven-plugin:9.16.0:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db -Dflyway.user=postgres -Dflyway.password=postgres123

# Build all services
mvn clean package -DskipTests

# Run a service (auth)
cd services/auth-service
mvn spring-boot:run
```

---

## Dependency files (full contents)

### `frontend/package.json`

```json
{
  "name": "ecommerce",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}
```

---

## SQL migrations (full contents)

### `backend-platform/src/main/resources/db/migration/V1__create_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

### `backend-platform/src/main/resources/db/migration/V2__create_products.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
```

### `backend-platform/src/main/resources/db/migration/V3__create_orders.sql`

```sql
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

---

## Service configurations (application.yml)

### `backend-platform/services/auth-service/src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: auth-service

  datasource:
    url: jdbc:postgresql://localhost:5432/ec2_db
    username: postgres
    password: postgres123
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    baseline-on-migrate: true

jwt:
  secret: ChangeThisToA256BitSecretKeyForProduction
  expiration: 900000
```

### `backend-platform/services/user-service/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: user-service

  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/backend_platform}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driverClassName: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8082
```

### `backend-platform/services/order-service/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: order-service

  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/backend_platform}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driverClassName: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8083
```

---

## Notes

- Flyway migrations are centralized in `backend-platform/src/main/resources/db/migration/` and the `flyway-maven-plugin` in the parent `pom.xml` is configured to run them.
- `auth-service` uses `ec2_db` by default; `user-service` and `order-service` default to `backend_platform` but can be overridden with environment variables.

