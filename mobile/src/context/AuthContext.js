import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../api/config';

const AuthContext = createContext(null);
const STORAGE_TOKEN = 'pawmart_access_token';
const STORAGE_EMAIL = 'pawmart_user_email';
const STORAGE_ROLES = 'pawmart_user_roles';
const STORAGE_REFRESH = 'pawmart_refresh_token';

const getApiUrl = () => config.API_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [roles, setRoles] = useState([]);
  const [refreshToken, setRefreshToken] = useState('');

  useEffect(() => {
    async function loadSaved() {
      const savedToken = await AsyncStorage.getItem(STORAGE_TOKEN);
      const savedEmail = await AsyncStorage.getItem(STORAGE_EMAIL);
      const savedRoles = await AsyncStorage.getItem(STORAGE_ROLES);
      const savedRefresh = await AsyncStorage.getItem(STORAGE_REFRESH);
      if (savedToken) setToken(savedToken);
      if (savedEmail) setUserEmail(savedEmail);
      if (savedRoles) setRoles(JSON.parse(savedRoles));
      if (savedRefresh) setRefreshToken(savedRefresh);
    }
    loadSaved();
  }, []);

  useEffect(() => {
    if (token) {
      AsyncStorage.setItem(STORAGE_TOKEN, token);
    } else {
      AsyncStorage.removeItem(STORAGE_TOKEN);
    }
  }, [token]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_EMAIL, userEmail || '');
  }, [userEmail]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_ROLES, JSON.stringify(roles || []));
  }, [roles]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_REFRESH, refreshToken || '');
  }, [refreshToken]);

  const login = (accessToken, email, newRoles = [], newRefreshToken = '') => {
    setToken(accessToken);
    setUserEmail(email);
    setRoles(newRoles);
    setRefreshToken(newRefreshToken);
  };

  const logout = async () => {
    setToken('');
    setUserEmail('');
    setRoles([]);
    setRefreshToken('');
    await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_EMAIL, STORAGE_ROLES, STORAGE_REFRESH]);
  };

  const refreshSession = async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      await logout();
      throw new Error('Unable to refresh');
    }
    const data = await response.json();
    login(data.accessToken, userEmail, data.roles || [], data.refreshToken || '');
    return data;
  };

  const signup = async (payload) => {
    return fetch(`${getApiUrl()}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const value = {
    token,
    userEmail,
    roles,
    refreshToken,
    isAuthenticated: Boolean(token),
    isAdmin: roles.includes('ADMIN'),
    login,
    logout,
    refreshSession,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
