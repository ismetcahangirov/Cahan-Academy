'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import adminApi, { setAccessToken } from '../lib/adminApi';
import { useRouter, useParams } from 'next/navigation';
import { setAdminMarker, clearAdminMarker } from './sessionMarker';

interface User {
  id: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
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
    setAdminMarker();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Kept in a ref so the mount-only effect below always sees the current locale/router.
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const routerRef = useRef(router);
  routerRef.current = router;

  const clearSession = useCallback(() => {
    setToken(null);
    setAccessToken(null);
    setUser(null);
    clearAdminMarker();
  }, []);

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout');
    } catch {
      // Even if the API is unreachable, the local session is dropped.
    } finally {
      clearSession();
      router.push(`/${locale}/login`);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await adminApi.post('/auth/refresh');

      if (data.success && data.data.accessToken) {
        setToken(data.data.accessToken);
        setAccessToken(data.data.accessToken);
        if (data.data.user) {
          setUser(data.data.user);
        }
        setAdminMarker();
        return true;
      }
      clearAdminMarker();
      return false;
    } catch {
      // No valid refresh cookie (expired, revoked by a password change, or blocked as a
      // third-party cookie): drop the marker so the middleware stops letting /dashboard through.
      clearAdminMarker();
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      setIsLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => {
      clearSession();
      routerRef.current.push(`/${localeRef.current}/login`);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, [refreshSession, clearSession]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, refreshSession, updateUser }}>
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
