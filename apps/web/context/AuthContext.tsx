'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi, { setAccessToken } from '../lib/adminApi';
import { useRouter, useParams } from 'next/navigation';

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
  const params = useParams();
  const locale = (params?.locale as string) || 'az';

  const login = (token: string, userData: User) => {
    setToken(token);
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout');
    } finally {
      setToken(null);
      setAccessToken(null);
      setUser(null);
      router.push(`/${locale}/login`);
    }
  };

  const refreshSession = async () => {
    try {
      const { data } = await adminApi.post('/auth/refresh');

      if (data.success && data.data.accessToken) {
        setToken(data.data.accessToken);
        setAccessToken(data.data.accessToken);
        if (data.data.user) {
          setUser(data.data.user);
        }
        return true;
      }
      return false;
    } catch (error) {
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
      router.push(`/${locale}/login`);
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
