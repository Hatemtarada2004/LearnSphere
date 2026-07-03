import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authService } from '../services/auth.service';
import { setAccessToken } from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    // Only call the API if we actually have a session token to invalidate
    if (accessToken) {
      try {
        await authService.logout();
      } catch {
        // Ignore — token may already be invalid
      }
    }
    setUser(null);
    setToken(null);
    setAccessToken(null);
  }, [accessToken]);

  // Initialize auth from refresh token cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const newToken = await authService.refreshToken();
        setToken(newToken);
        setAccessToken(newToken);
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch {
        // No valid session — network error or no cookie
        setUser(null);
        setToken(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Safety fallback: if network is completely unreachable, unblock the UI after 8s
    const fallback = setTimeout(() => setIsLoading(false), 8000);
    initAuth().finally(() => clearTimeout(fallback));
  }, []);

  // Listen for forced logout events from axios interceptor
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.accessToken);
    setAccessToken(data.accessToken);
    return data.user;
  };

  const register = async (data: RegisterData) => {
    const result = await authService.register(data);
    setUser(result.user);
    setToken(result.accessToken);
    setAccessToken(result.accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
