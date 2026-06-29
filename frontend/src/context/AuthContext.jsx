import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'pawmart_access_token';
const STORAGE_EMAIL = 'pawmart_user_email';
const STORAGE_REFRESH = 'pawmart_refresh_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem(STORAGE_EMAIL) || '');
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('pawmart_user_roles');
    return saved ? JSON.parse(saved) : [];
  });
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(STORAGE_REFRESH) || '');

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

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem(STORAGE_REFRESH, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_REFRESH);
    }
  }, [refreshToken]);

  useEffect(() => {
    if (!token && refreshToken) {
      refreshSession().catch(() => {
        /* ignore failures; logout already happens inside refreshSession */
      });
    }
  }, [refreshToken, token]);

  const login = (newToken, email, newRoles = [], newRefreshToken = '') => {
    setToken(newToken);
    setUserEmail(email);
    setRoles(newRoles);
    setRefreshToken(newRefreshToken);
  };

  const refreshSession = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      throw new Error('Unable to refresh session');
    }

    const data = await response.json();
    login(data.accessToken, userEmail, data.roles || [], data.refreshToken || '');
    return data;
  };

  const hardRefresh = async () => {
    return refreshSession();
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
    setRefreshToken('');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        userEmail,
        roles,
        isAdmin: roles.includes('ADMIN'),
        login,
        logout,
        signup,
        requestPasswordReset,
        refreshSession,
        hardRefresh,
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
