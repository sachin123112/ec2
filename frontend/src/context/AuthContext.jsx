import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'pawmart_access_token';
const STORAGE_EMAIL = 'pawmart_user_email';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem(STORAGE_EMAIL) || '');

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

  const login = (newToken, email) => {
    setToken(newToken);
    setUserEmail(email);
  };

  const logout = () => {
    setToken('');
    setUserEmail('');
  };

  return (
    <AuthContext.Provider
      value={{ token, userEmail, login, logout, isAuthenticated: Boolean(token) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
