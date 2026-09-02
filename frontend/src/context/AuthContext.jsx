/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'pawmart_access_token';
const STORAGE_EMAIL = 'pawmart_user_email';
const STORAGE_REFRESH = 'pawmart_refresh_token';

function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const binary = atob(padded);
    const json = decodeURIComponent(
      Array.from(binary).map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    return JSON.parse(json);
  } catch (error) {
    console.warn('Unable to decode JWT payload:', error);
    return null;
  }
}

function isTokenExpired(tokenValue) {
  const payload = decodeJwtPayload(tokenValue);
  if (!payload || !payload.exp) return false;
  return Number(payload.exp) * 1000 <= Date.now();
}

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

  const logout = useCallback(() => {
    setToken('');
    setUserEmail('');
    setRoles([]);
    setRefreshToken('');
  }, []);

  const refreshSession = useCallback(async () => {
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
    setToken(data.accessToken);
    setUserEmail(userEmail);
    setRoles(data.roles || []);
    setRefreshToken(data.refreshToken || '');
    return data;
  }, [refreshToken, userEmail, logout]);

  useEffect(() => {
    if ((!token && refreshToken) || (token && isTokenExpired(token) && refreshToken)) {
      refreshSession().catch(() => {
        /* ignore failures; logout already happens inside refreshSession */
      });
    }
  }, [refreshToken, token, refreshSession]);

  const login = (newToken, email, newRoles = [], newRefreshToken = '') => {
    setToken(newToken);
    setUserEmail(email);
    setRoles(newRoles);
    setRefreshToken(newRefreshToken);
  };

  const hardRefresh = async () => {
    return refreshSession();
  };

  const signup = async (payload) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
