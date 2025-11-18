// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // Check localStorage flag to see if user might be logged in
      const hasAuth = localStorage.getItem('hasAuth');

      if (!hasAuth) {
        // Skip the API call if we know there's no auth
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
        localStorage.setItem('hasAuth', 'true');
      } catch (err) {
        // User is not logged in or token expired
        setUser(null);
        localStorage.removeItem('hasAuth');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    // After login, reload user profile to ensure we have latest data
    const profileRes = await api.get('/auth/profile');
    setUser(profileRes.data);
    localStorage.setItem('hasAuth', 'true');

    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('hasAuth');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);