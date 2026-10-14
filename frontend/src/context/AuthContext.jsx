import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('hq_user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const persist = (u, t) => {
    if (u) localStorage.setItem('hq_user', JSON.stringify(u));
    else localStorage.removeItem('hq_user');
    if (t) localStorage.setItem('hq_token', t);
    else localStorage.removeItem('hq_token');
  };

  const login = useCallback(async (mobile, password) => {
    const { data } = await api.post('/auth/login', { mobile, password });
    persist(data.user, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data.user, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => { persist(null, null); setUser(null); }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('hq_token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user); persist(data.user, token);
      } catch { persist(null, null); setUser(null); }
      finally { setLoading(false); }
    };
    bootstrap();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};