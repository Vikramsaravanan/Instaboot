import { useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

/**
 * Simple auth hook — reads/writes token + user from localStorage.
 * Wrap your app with this and pass the returned values via context if needed.
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const persist = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      persist(data.token, data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRegister({ name, email, password });
      persist(data.token, data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return { user, error, loading, login, register, logout };
}
