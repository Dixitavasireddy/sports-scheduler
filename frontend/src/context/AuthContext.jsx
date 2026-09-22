import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/me');
      setUser(data.user);
      setError(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    const data = await api.post('/auth/login', { email, password });
    setUser(data.user);
    await api.refreshCsrfToken();
    return data.user;
  };

  // Register handler
  const register = async (name, email, password, confirmPassword) => {
    setError(null);
    const data = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    setUser(data.user);
    await api.refreshCsrfToken();
    return data.user;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      await api.refreshCsrfToken();
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
