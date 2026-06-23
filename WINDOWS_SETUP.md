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

### 5. Install Git Bash (Optional but Recommended)
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

### Step 3: Build Backend Services
```cmd
mvn clean package -DskipTests
```

### Step 4: Run Individual Services

#### Option A: Run Auth Service
```cmd
cd services/auth-service
mvn spring-boot:run
```
- Runs on: `http://localhost:8080`
- API endpoint: `http://localhost:8080/api/v1/auth/login`

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

### Step 5: Run All Services (Docker - Optional)
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
