import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and exposes auth state + helpers.
 * user: { _id, username, email, role, token } | null
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Persist user to localStorage whenever it changes */
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', user.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  /** Login — calls POST /api/users/login */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/users/login', { email, password });
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Logout — clears state and storage */
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  /** Register — calls POST /api/users/register */
  const register = useCallback(async (username, email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/users/register', { username, email, password, role });
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin' || user?.role === 'host';

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
