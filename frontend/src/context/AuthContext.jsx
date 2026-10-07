import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('verifiedEkyc');
    localStorage.removeItem('loanApplicationDraft');
    localStorage.removeItem('selectedLoanProposal');
    localStorage.removeItem('activeLoanStatus');
    localStorage.removeItem('uploadedLoanDocuments');
    localStorage.removeItem('lastApplicationId');
    localStorage.removeItem('lastApplicationNo');
    setToken(null);
    setUser(null);
  };

  // Quick Demo Login for instant testing during demo
  const quickDemoLogin = async (role = 'customer') => {
    const demoAccounts = {
      customer: 'customer@demo.com',
      credit_officer: 'officer@demo.com',
      admin: 'admin@demo.com'
    };
    const email = demoAccounts[role] || 'customer@demo.com';
    return await login(email, 'password123');
  };

  const updateCurrentUser = (partialUser) => {
    setUser(prev => prev ? ({ ...prev, ...partialUser }) : partialUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickDemoLogin, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
