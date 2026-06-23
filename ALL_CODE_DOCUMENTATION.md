# Complete Codebase Documentation

This document lists the repository files (frontend and backend), provides a short explanation for each source file, and includes the full contents of dependency files and CI workflow files.

Generated: 2026-06-23

---

## Table of Contents

- Frontend files
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

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

### `backend-platform/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.company</groupId>
    <artifactId>backend-platform</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>Enterprise Backend Platform</name>
    <description>Microservices-based e-commerce platform</description>

    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <spring-boot.version>3.0.0</spring-boot.version>
        <spring-cloud.version>2022.0.0</spring-cloud.version>
    </properties>

    <modules>
        <module>services/auth-service</module>
        <module>services/user-service</module>
        <module>services/order-service</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>
            <plugin>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-maven-plugin</artifactId>
                <version>9.16.0</version>
                <configuration>
                    <locations>
                        <location>filesystem:${project.basedir}/src/main/resources/db/migration</location>
                    </locations>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>org.postgresql</groupId>
                        <artifactId>postgresql</artifactId>
                        <version>42.7.1</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>
```

### `auth-service/pom.xml` (excerpt)

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">

    <parent>
        <groupId>com.company</groupId>
        <artifactId>backend-platform</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>auth-service</artifactId>

    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.7</version>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.7</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.7</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Database and migration -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.7.1</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

    </dependencies>

</project>
```

### `user-service/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.company</groupId>
        <artifactId>backend-platform</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>user-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>User Service</name>
    <description>User management microservice</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### `order-service/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.company</groupId>
        <artifactId>backend-platform</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>order-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Order Service</name>
    <description>Order management microservice</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## CI/CD workflow files (full contents)

### `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [ main ]
    paths:
      - 'services/**'
      - 'backend-platform/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'services/**'
      - 'backend-platform/**'

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres123
          POSTGRES_DB: ec2_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Wait for Postgres
      run: |
        sudo apt-get update
        sudo apt-get install -y postgresql-client
        for i in {1..30}; do pg_isready -h localhost -p 5432 -U postgres && break || sleep 1; done

    - name: Run Flyway migrations
      run: |
        cd backend-platform
        mvn org.flywaydb:flyway-maven-plugin:9.16.0:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db -Dflyway.user=postgres -Dflyway.password=postgres123

    - name: Build backend-platform
      run: |
        cd backend-platform
        mvn clean package -DskipTests

    - name: Run backend tests
      run: |
        cd backend-platform
        mvn test

    - name: Build individual services
      run: |
        for service in backend-platform/services/*/; do
          service_name=$(basename "$service")
          if [ -f "$service/pom.xml" ]; then
            echo "Building $service_name..."
            cd "$service"
            mvn clean package -DskipTests
            cd ../../..
          fi
        done
      continue-on-error: true

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: backend-build-logs
        path: |
          backend-platform/target/
          backend-platform/services/*/target/

```

### `.github/workflows/frontend-ci-cd.yml`

```yaml
name: Frontend CI/CD
on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '24'
        cache: 'npm'
        cache-dependency-path: 'frontend/package-lock.json'

    - name: Install dependencies
      run: |
        cd frontend
        npm ci

    - name: Run linting
      run: |
        cd frontend
        npm run lint
      continue-on-error: true

    - name: Build frontend
      run: |
        cd frontend
        npm run build

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: frontend-build
        path: frontend/dist
        retention-days: 7

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
    - name: Download build artifact
      uses: actions/download-artifact@v4
      with:
        name: frontend-build
        path: ./dist

    - name: Setup Pages
      uses: actions/configure-pages@v4
      with:
        enablement: true

    - name: Upload to Pages
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
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

## Service `application.yml` files (full contents)

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

## Next steps and commands

- **Commit and push**: branch `docs/add-full-docs` already created and pushed.
- **Open PR**: create a pull request from `docs/add-full-docs` → `main` to run CI and review changes.

To open the PR locally (requires `gh` CLI):

```bash
gh pr create --title "docs: add full code documentation" --body "Add exhaustive code, configs, migrations, and CI workflow contents to ALL_CODE_DOCUMENTATION.md" --base main --head docs/add-full-docs
```

To run backend CI-like checks locally (basic):

```bash
# Start Postgres for local testing
docker run -d --name postgres_ec2 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=ec2_db -p 5432:5432 postgres:16

# Run Flyway migrations from backend-platform
cd backend-platform
mvn org.flywaydb:flyway-maven-plugin:9.16.0:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ec2_db -Dflyway.user=postgres -Dflyway.password=postgres123

# Build backend
mvn clean package -DskipTests
```

If you want, I can create the PR now and monitor CI; shall I proceed? 

