# Windows Local Development Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Dependencies Installation](#dependencies-installation)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running Both Services](#running-both-services)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Hardware
- **RAM**: 8GB (16GB recommended)
- **Disk Space**: 10GB free
- **Processor**: Intel Core i5 or equivalent

### Operating System
- Windows 10/11 (x64)

---

## Dependencies Installation

### 1. Install Git
- **Download**: [git-scm.com](https://git-scm.com/download/win)
- **Version**: 2.40 or higher
- **Installation**: Use default settings, add to PATH

### 2. Install Node.js
- **Download**: [nodejs.org](https://nodejs.org/)
- **Version**: 20 LTS or higher (Node 24 recommended)
- **Installation Steps**:
  1. Download the Windows Installer (.msi)
  2. Run the installer
  3. Check "Add to PATH" during installation
  4. Verify installation:
     ```cmd
     node --version
     npm --version
     ```

### 3. Install Java Development Kit (JDK)
- **Download**: [adoptium.net](https://adoptium.net/) (Temurin JDK)
- **Version**: JDK 17 or higher
- **Installation Steps**:
  1. Download Windows x64 MSI installer
  2. Run installer, select "Set JAVA_HOME variable"
  3. Verify installation:
     ```cmd
     java -version
     ```

### 4. Install Maven
- **Download**: [maven.apache.org](https://maven.apache.org/download.cgi)
- **Version**: 3.8.1 or higher
- **Installation Steps**:
  1. Download Binary zip (`apache-maven-x.x.x-bin.zip`)
  2. Extract to `C:\Program Files\Apache\maven`
  3. Add to Environment Variables:
     - Variable name: `MAVEN_HOME`
     - Variable value: `C:\Program Files\Apache\maven`
  4. Add to PATH: `%MAVEN_HOME%\bin`
  5. Verify installation:
     ```cmd
     mvn --version
     ```

### 5. Install PostgreSQL
- **Download**: [postgresql.org](https://www.postgresql.org/download/windows/)
- **Version**: 14 or higher (16 recommended)
- **Installation Steps**:
  1. Download PostgreSQL installer (.exe)
  2. Run installer
  3. Choose installation directory (e.g., `C:\Program Files\PostgreSQL`)
  4. Set superuser password (remember this!)
  5. Port: 5432 (default)
  6. Verify installation:
     ```cmd
     psql --version
     ```

### 6. Install pgAdmin 4 (Optional - GUI for PostgreSQL)
- **Download**: [pgadmin.org](https://www.pgadmin.org/download/pgadmin-4-windows/)
- Provides GUI to manage databases
- Access at: `http://localhost:5050`

### 7. Install Git Bash (Optional but Recommended)
- Included with Git installation
- Provides Unix-like terminal on Windows

---

## Project Structure

```
ec2/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   ├── package.json
│   └── vite.config.js
│
├── backend-platform/            # Backend services parent
│   ├── pom.xml
│   ├── services/
│   │   ├── auth-service/        # Authentication microservice
│   │   ├── user-service/        # User management microservice
│   │   └── order-service/       # Order processing microservice
│   └── docker-compose.yml
│
├── database/                    # Database migrations
│   └── migrations/
│       ├── V1__create_users.sql
│       ├── V2__create_products.sql
│       └── V3__create_orders.sql
│
├── .github/workflows/           # CI/CD workflows
│   ├── backend-ci.yml
│   └── frontend-ci-cd.yml
│
└── README.md
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```cmd
cd backend-platform
```

### Step 2: Install Dependencies
```cmd
mvn clean install
```
This will:
- Download all Maven dependencies
- Compile all Java code
- Run tests (if configured)

### Step 3: Database Configuration

Before running services, ensure PostgreSQL is configured:

1. **Check PostgreSQL is running**:
   ```cmd
   psql -U postgres -c "SELECT 1"
   ```

2. **Verify database exists**:
   ```cmd
   psql -U postgres -l
   ```

3. **Update backend database credentials** in `backend-platform/services/auth-service/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/ec2_db
       username: postgres
       password: your_postgres_password
   ```

### Step 4: Build Backend Services
```cmd
mvn clean package -DskipTests
```

### Step 5: Run Individual Services

#### Option A: Run Auth Service
```cmd
cd services/auth-service
mvn spring-boot:run
```
- Runs on: `http://localhost:8080`
- API endpoint: `http://localhost:8080/api/v1/auth/login`
- Database: `ec2_db` on PostgreSQL

#### Option B: Run User Service
```cmd
cd services/user-service
mvn spring-boot:run
```
- Runs on: `http://localhost:8081`

#### Option C: Run Order Service
```cmd
cd services/order-service
mvn spring-boot:run
```
- Runs on: `http://localhost:8082`

### Step 6: Run All Services (Docker - Optional)
```cmd
docker-compose up
```
Requires Docker Desktop installed on Windows.

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```cmd
cd frontend
```

### Step 2: Install Node Dependencies
```cmd
npm install
```

### Step 3: Verify Installation
```cmd
npm --version
node --version
```

### Step 4: Run Development Server
```cmd
npm run dev
```
- Local server: `http://localhost:5173`
- Network: `http://<your-ip>:5173`

### Step 5: Build for Production
```cmd
npm run build
```
- Output: `frontend/dist/` folder
- Ready for deployment to GitHub Pages

### Step 6: Run Linting
```cmd
npm run lint
```

### Step 7: Preview Production Build
```cmd
npm run preview
```

---

## Running Both Services Simultaneously

### Option 1: Using Multiple Command Prompt Windows

**Terminal 1 - Backend**:
```cmd
cd ec2/backend-platform/services/auth-service
mvn spring-boot:run
```

**Terminal 2 - Frontend**:
```cmd
cd ec2/frontend
npm run dev
```

**Terminal 3 - Optional (Database migrations)**:
```cmd
cd ec2/database
# Run SQL migrations manually or use your database tool
```

### Option 2: Using VS Code Integrated Terminal

1. Open project in VS Code
2. Open Terminal: `Ctrl + ` (backtick)
3. Split Terminal: Click split icon
4. Run backend in one terminal, frontend in another

### Option 3: Using Git Bash

1. Open Git Bash
2. Navigate to `ec2` folder
3. Create startup script `start-services.sh`:

```bash
#!/bin/bash

# Start backend
cd backend-platform/services/auth-service
mvn spring-boot:run &
BACKEND_PID=$!

# Start frontend
cd ../../../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Both services running..."
```

Run with:
```bash
chmod +x start-services.sh
./start-services.sh
```

---

## Configuration Files

### Frontend Configuration
**File**: `frontend/vite.config.js`
```javascript
export default {
  server: {
    port: 5173,
    host: 'localhost'
  }
}
```

### Backend Configuration
**File**: `backend-platform/services/auth-service/src/main/resources/application.yml`
```yaml
server:
  port: 8080
spring:
  application:
    name: auth-service
```

### Environment Variables
Create `.env` file in `frontend/` folder (optional):
```
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=5000
```

---

## Development Workflow

### Step-by-Step Workflow
1. **Clone repository**
   ```cmd
   git clone https://github.com/sachin123112/ec2.git
   cd ec2
   ```

2. **Create feature branch**
   ```cmd
   git checkout -b feature/your-feature-name
   ```

3. **Make changes** to frontend/backend code

4. **Test locally**
   - Frontend: `npm run dev` → `http://localhost:5173`
   - Backend: `mvn spring-boot:run` → `http://localhost:8080`

5. **Run linting**
   ```cmd
   npm run lint        # Frontend
   mvn clean verify    # Backend
   ```

6. **Commit changes**
   ```cmd
   git add .
   git commit -m "feat: your feature description"
   ```

7. **Push to remote**
   ```cmd
   git push origin feature/your-feature-name
   ```

8. **Create Pull Request** on GitHub

9. **CI/CD automatically**:
   - Runs backend tests
   - Builds frontend
   - Deploys to GitHub Pages

---

## Database Setup

### PostgreSQL Setup (Recommended)

#### Step 1: Create Database
Open Command Prompt or pgAdmin and run:

```sql
-- Connect to PostgreSQL default database
psql -U postgres

-- Create application database
CREATE DATABASE ec2_db;

-- Connect to new database
\c ec2_db
```

#### Step 2: Create Tables

**Users Table** - `V1__create_users.sql`:
```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**Products Table** - `V2__create_products.sql`:
```sql
CREATE TABLE products (
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

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
```

**Orders Table** - `V3__create_orders.sql`:
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

#### Step 3: Run All Migrations via Command Line

**Using psql**:
```cmd
psql -U postgres -d ec2_db -f database/migrations/V1__create_users.sql
psql -U postgres -d ec2_db -f database/migrations/V2__create_products.sql
psql -U postgres -d ec2_db -f database/migrations/V3__create_orders.sql
```

**Or use pgAdmin GUI**:
1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL 16 → Databases → ec2_db
3. Right-click → Query Tool
4. Copy-paste SQL from migration files
5. Click "Execute" button

### PostgreSQL Connection Configuration

#### For Backend (Spring Boot)

Create/Update: `backend-platform/services/auth-service/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: auth-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/ec2_db
    username: postgres
    password: your_postgres_password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          batch_size: 20
    show-sql: false
  
  liquibase:
    enabled: false

server:
  port: 8080
```

#### Update pom.xml (Maven Dependencies)

Add PostgreSQL JDBC driver to `backend-platform/pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
    <scope>runtime</scope>
</dependency>

<!-- JPA/Hibernate -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
    <version>3.0.0</version>
</dependency>
```

### PostgreSQL Useful Commands

| Command | Purpose |
|---------|---------|
| `psql -U postgres` | Connect as superuser |
| `\l` | List all databases |
| `\c database_name` | Connect to database |
| `\dt` | List all tables |
| `\d table_name` | Describe table schema |
| `\du` | List all users/roles |
| `CREATE USER app_user WITH PASSWORD 'password';` | Create new user |
| `GRANT ALL PRIVILEGES ON DATABASE ec2_db TO app_user;` | Grant permissions |

### Using pgAdmin GUI

1. **Launch pgAdmin**:
   - Open browser: `http://localhost:5050`
   - Email: postgres@pgadmin.com
   - Password: admin (default)

2. **Add PostgreSQL Server**:
   - Right-click "Servers" → "Register" → "Server"
   - Name: `local_postgres`
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: `your_password`

3. **Create Database**:
   - Right-click "Databases" → "Create" → "Database"
   - Name: `ec2_db`
   - Owner: `postgres`

4. **Run SQL Scripts**:
   - Right-click `ec2_db` → "Query Tool"
   - Copy-paste SQL migration scripts
   - Click "Execute"

### SQL Server Setup (Alternative)

If using SQL Server instead:

#### Step 1: Install SQL Server Express
- **Download**: [Microsoft SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Edition**: SQL Server 2022 Express

#### Step 2: Create Database
```sql
CREATE DATABASE ec2_db;
USE ec2_db;
```

#### Step 3: Create Tables (SQL Server Syntax)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT GETDATE()
);
```

#### Step 4: Update Backend Config for SQL Server

`application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=ec2_db
    username: sa
    password: YourPassword123
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServerDialect
```

### Docker PostgreSQL (Optional)

If you prefer Docker instead of local installation:

```cmd
docker run -d \
  --name postgres_ec2 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=ec2_db \
  -p 5432:5432 \
  postgres:16
```

Connect with:
```
Host: localhost
Port: 5432
Username: postgres
Password: postgres123
Database: ec2_db
```

---

### SQL Server (Optional)

If using SQL Server, install:
- **Download**: [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- Run migrations from `database/migrations/` folder

### Using Docker for Database (Recommended)
```cmd
docker run -e ACCEPT_EULA=Y -e SA_PASSWORD=YourPassword123 -p 1433:1433 -d mcr.microsoft.com/mssql/server
```

---

## Troubleshooting

### Issue: `mvn is not recognized`
**Solution**: Add Maven to PATH environment variable
1. Go to: Control Panel → System → Advanced system settings
2. Click "Environment Variables"
3. Add `C:\Program Files\Apache\maven\bin` to PATH

### Issue: `npm: command not found`
**Solution**: Reinstall Node.js and ensure PATH is set
```cmd
where npm
```

### Issue: Port already in use
**Solution**: 
- Change port in config file, or
- Kill process using port:
  ```cmd
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```

### Issue: Java version mismatch
**Solution**: Verify JDK version
```cmd
java -version
```
Ensure it's JDK 17+, not JRE

### Issue: Dependencies not downloading
**Solution**: Clear Maven cache and reinstall
```cmd
rmdir /s /q %USERPROFILE%\.m2\repository
mvn clean install
```

### Issue: Port 5173 not accessible
**Solution**: Check firewall settings or use different port:
```cmd
npm run dev -- --port 3000
```

---

## Useful Commands Reference

### Frontend Commands
| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend Commands
| Command | Purpose |
|---------|---------|
| `mvn clean install` | Install dependencies |
| `mvn clean package` | Build package |
| `mvn spring-boot:run` | Run Spring Boot app |
| `mvn test` | Run tests |
| `mvn clean verify` | Clean and verify |

### Git Commands
| Command | Purpose |
|---------|---------|
| `git clone <url>` | Clone repository |
| `git checkout -b feature/<name>` | Create feature branch |
| `git status` | Check git status |
| `git add .` | Stage all changes |
| `git commit -m "<msg>"` | Commit changes |
| `git push origin <branch>` | Push to remote |
| `git pull origin main` | Update from remote |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Windows Local System                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │   Frontend      │         │    Backend Services  │  │
│  │  (React+Vite)   │◄────────┤  (Spring Boot Java)  │  │
│  │                 │         │                      │  │
│  │ Port: 5173      │         │ Auth: 8080          │  │
│  │ npm run dev     │         │ User: 8081          │  │
│  └────────┬────────┘         │ Order: 8082         │  │
│           │                  │                      │  │
│           │ HTTP             │ mvn spring-boot:run │  │
│           │                  └──────────┬───────────┘  │
│           │                             │              │
│           └─────────────────────────────┘              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Database (SQL Server / Docker)                  │  │
│  │  - Users, Products, Orders tables                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Install all dependencies (Git, Node.js, JDK, Maven)
2. ✅ Clone repository: `git clone https://github.com/sachin123112/ec2.git`
3. ✅ Install frontend: `cd frontend && npm install`
4. ✅ Install backend: `cd ../backend-platform && mvn clean install`
5. ✅ Run frontend: `cd frontend && npm run dev`
6. ✅ Run backend: `cd backend-platform/services/auth-service && mvn spring-boot:run`
7. ✅ Access frontend: `http://localhost:5173`
8. ✅ Access API: `http://localhost:8080/api/v1/auth`

---

## Support & Resources

- **GitHub Issues**: Report bugs at [GitHub Issues](https://github.com/sachin123112/ec2/issues)
- **Documentation**: See [README.md](README.md)
- **CI/CD Status**: Monitor at [GitHub Actions](https://github.com/sachin123112/ec2/actions)
- **Frontend Deploy**: Visit [GitHub Pages](https://sachin123112.github.io/ec2/)

---

**Last Updated**: June 23, 2026
**Maintained By**: Development Team
