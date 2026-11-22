import { createContext, useContext, useEffect, useState } from 'react';
import { api, setTokens, clearTokens, getAccess } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccess()) { setLoading(false); return; }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const data = await api(path, { method: 'POST', body });
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };
  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (form) => authenticate('/auth/register', form);
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    clearTokens();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
