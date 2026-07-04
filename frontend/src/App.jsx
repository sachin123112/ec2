import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminNav from './pages/AdminNav';
import ProductsAdmin from './pages/ProductsAdmin';
import UsersAdmin from './pages/UsersAdmin';
import RolesAdmin from './pages/RolesAdmin';
import LinksAdmin from './pages/LinksAdmin';
import CategoriesAdmin from './pages/CategoriesAdmin';
import OrdersAdmin from './pages/OrdersAdmin';
import GoogleCallback from './pages/GoogleCallback';
import UserDashboard from './pages/UserDashboard';
import './App.css';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, roles } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const hideLayout = authPaths.includes(location.pathname);

  return (
    <div className="app-wrapper">
      {!hideLayout && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="USER">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Dashboard initialTab="products" showOverview />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <UsersAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/navigation" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminNav />
            </ProtectedRoute>
          } />
          <Route path="/admin/roles" element={
            <ProtectedRoute requiredRole="ADMIN">
              <RolesAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/links" element={
            <ProtectedRoute requiredRole="ADMIN">
              <LinksAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requiredRole="ADMIN">
              <ProductsAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute requiredRole="ADMIN">
              <CategoriesAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requiredRole="ADMIN">
              <OrdersAdmin />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
