'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi, { setAccessToken } from '../lib/adminApi';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (accessToken: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (token: string, userData: User, refreshToken?: string) => {
    setToken(token);
    setAccessToken(token);
    setUser(userData);
    // Refresh token-i localStorage-da saxla
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      // Middleware üçün cookie təyin et (7 gün)
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
    }
  };

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout');
    } finally {
      setToken(null);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
      // Cookie-ni sil
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push('/login');
    }
  };

  const refreshSession = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) return false;

      const { data } = await adminApi.post('/auth/refresh', { 
        refreshToken: storedRefreshToken 
      });

      if (data.success && data.data.accessToken) {
        setToken(data.data.accessToken);
        setAccessToken(data.data.accessToken);
        // Yeni refresh token gəlirsə yenilə
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
          document.cookie = `refreshToken=${data.data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
        }
        if (data.data.user) {
          setUser(data.data.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      localStorage.removeItem('refreshToken');
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      setIsLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => {
      setToken(null);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
      router.push('/login');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
