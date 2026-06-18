import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getProfile();
          if (res.success) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLogin = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      if (res.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please check your input.',
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      if (res.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
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
