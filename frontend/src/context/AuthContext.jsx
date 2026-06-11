import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const MOCK_USERS = {
  'admin@taskflow.com': {
    id: '1',
    name: 'Admin User',
    email: 'admin@taskflow.com',
    role: 'Administrator',
    avatar: null,
    password: 'admin123',
  },
  'pm@taskflow.com': {
    id: '2',
    name: 'Sarah Miller',
    email: 'pm@taskflow.com',
    role: 'Project Manager',
    avatar: null,
    password: 'pm123',
  },
  'collab@taskflow.com': {
    id: '3',
    name: 'John Doe',
    email: 'collab@taskflow.com',
    role: 'Collaborator',
    avatar: null,
    password: 'collab123',
  },
};

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
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      const fakeToken = 'jwt_' + btoa(email) + '_' + Date.now();
      const userData = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar,
      };

      setToken(fakeToken);
      setUser(userData);
      localStorage.setItem('taskflow_token', fakeToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return { success: true };
    }

    throw new Error('Incorrect email or password. Please try again.');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Administrator';
  const isProjectManager = user?.role === 'Project Manager';
  const isCollaborator = user?.role === 'Collaborator';

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
