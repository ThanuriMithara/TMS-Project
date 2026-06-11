import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('taskflow_token');
    const savedUser = localStorage.getItem('taskflow_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user, must_reset_password } = response.data;
    if (must_reset_password !== undefined) {
      user.must_reset_password = must_reset_password;
    }
    setToken(token);
    setUser(user);
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(user));
    return { success: true, must_reset_password: user.must_reset_password };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isProjectManager = user?.role === 'project_manager';
  const isCollaborator = user?.role === 'collaborator';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isProjectManager,
        isCollaborator,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;