import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'pawmart_access_token';
const STORAGE_EMAIL = 'pawmart_user_email';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem(STORAGE_EMAIL) || '');
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('pawmart_user_roles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(STORAGE_EMAIL, userEmail);
    } else {
      localStorage.removeItem(STORAGE_EMAIL);
    }
  }, [userEmail]);

  useEffect(() => {
    if (roles && roles.length > 0) {
      localStorage.setItem('pawmart_user_roles', JSON.stringify(roles));
    } else {
      localStorage.removeItem('pawmart_user_roles');
    }
  }, [roles]);

  const login = (newToken, email, newRoles = []) => {
    setToken(newToken);
    setUserEmail(email);
    setRoles(newRoles);
  };

  const signup = async (email, password) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res;
  };

  const requestPasswordReset = async (email) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res;
  };

  const logout = () => {
    setToken('');
    setUserEmail('');
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        roles,
        isAdmin: roles.includes('ADMIN'),
        login,
        logout,
        signup,
        requestPasswordReset,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
