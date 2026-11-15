import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gctp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gctp_token') || null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gctp_settings');
    return saved ? JSON.parse(saved) : { preferred_language: 'English', preferred_tone: 'Professional', theme: 'dark' };
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync token and user with API on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profileRes = await api.getProfile();
          if (profileRes.success) {
            setUser(profileRes.user);
            localStorage.setItem('gctp_user', JSON.stringify(profileRes.user));
          }
          const settingsRes = await api.getSettings();
          if (settingsRes.success) {
            setSettings(settingsRes.settings);
            localStorage.setItem('gctp_settings', JSON.stringify(settingsRes.settings));
          }
        } catch (err) {
          console.warn('Initial session validation failed:', err.message);
          // If token expired, clear
          if (err.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      if (res.settings) {
        setSettings(res.settings);
        localStorage.setItem('gctp_settings', JSON.stringify(res.settings));
      }
      localStorage.setItem('gctp_token', res.token);
      localStorage.setItem('gctp_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.register(fullName, email, password, confirmPassword);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      if (res.settings) {
        setSettings(res.settings);
        localStorage.setItem('gctp_settings', JSON.stringify(res.settings));
      }
      localStorage.setItem('gctp_token', res.token);
      localStorage.setItem('gctp_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.logout().catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('gctp_token');
      localStorage.removeItem('gctp_user');
    }
  }, [token]);

  const updateUserProfile = async (fullName) => {
    const res = await api.updateProfile(fullName);
    if (res.success) {
      setUser(res.user);
      localStorage.setItem('gctp_user', JSON.stringify(res.user));
    }
    return res;
  };

  const updateUserSettings = async (newSettings) => {
    const res = await api.updateSettings(newSettings);
    if (res.success) {
      setSettings(res.settings);
      localStorage.setItem('gctp_settings', JSON.stringify(res.settings));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        settings,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
