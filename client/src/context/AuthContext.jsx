import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('daytrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('daytrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('daytrack_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('daytrack_token', res.data.token);
      localStorage.setItem('daytrack_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.success && res.data) {
      setUser(res.data);
      setToken(res.data.token);
      localStorage.setItem('daytrack_token', res.data.token);
      localStorage.setItem('daytrack_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('daytrack_token');
    localStorage.removeItem('daytrack_user');
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.success) {
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('daytrack_user', JSON.stringify(updated));
      return updated;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
