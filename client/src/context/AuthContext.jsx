import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('fixnearby_token');
    if (!token) {
      setUser(null);
      setProviderProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
        setProviderProfile(data.providerProfile || null);
      } else {
        localStorage.removeItem('fixnearby_token');
        setUser(null);
        setProviderProfile(null);
      }
    } catch (err) {
      console.warn('[AuthContext] Session check failed:', err.message);
      localStorage.removeItem('fixnearby_token');
      setUser(null);
      setProviderProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token) {
      localStorage.setItem('fixnearby_token', res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile || null);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.token) {
      localStorage.setItem('fixnearby_token', res.token);
      setUser(res.user);
      setProviderProfile(res.providerProfile || null);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('fixnearby_token');
    setUser(null);
    setProviderProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUser,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isProvider: user?.role === 'provider',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
