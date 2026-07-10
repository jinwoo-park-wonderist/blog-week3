import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  async function login(username, password) {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  const value = { token, isAuthenticated: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}