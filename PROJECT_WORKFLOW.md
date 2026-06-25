# Project Workflow

## New Feature: Admin Login + Dashboard

### Purpose
This feature adds an admin login page and a dashboard page for product, user, and order management.

### Included functionality
- `/login` page for admin authentication
- `/dashboard` page after login
- product creation and listing
- user creation and listing
- order creation and tracking
- direct persistence into PostgreSQL via JPA

### Credentials
- Username / email: `admin@pawmart.com`
- Password: `admin123`

### Frontend files added/updated
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Login.css`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Dashboard.css`
- `frontend/src/App.jsx`
- `frontend/src/components/Navbar.jsx`

### Backend files added/updated
- `backend-platform/services/auth-service/src/main/java/com/company/auth/model/User.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/model/Product.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/model/OrderEntity.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/repository/UserRepository.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/repository/ProductRepository.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/repository/OrderRepository.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/AuthController.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/controller/ApiController.java`
- `backend-platform/services/auth-service/src/main/java/com/company/auth/config/SecurityConfig.java`
- `backend-platform/services/auth-service/src/main/resources/db/migration/V1__create_base_tables.sql`

### Backend service location
- `backend-platform/services/auth-service`

### Frontend route
- Open `http://localhost:5173/login` after starting the frontend dev server.

### Notes
- Backend is configured to connect to PostgreSQL at `jdbc:postgresql://localhost:5432/ec2_db`
- The backend started successfully on port `8080`
- The login route is `POST /api/v1/auth/login`
- Dashboard APIs are under `/api/v1/users`, `/api/v1/products`, and `/api/v1/orders`
