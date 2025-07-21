import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType, type User } from '@/contexts/AuthContext';
import apiClient from '@/http/client';
import { authStorageService } from '@/services/authStorageService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    authStorageService.getAccessToken()
  );
  const [user, setUser] = useState<User | null>(authStorageService.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = (newAccessToken: string, newUser: User) => {
    authStorageService.setAccessToken(newAccessToken);
    authStorageService.setUser(newUser);
    setAccessToken(newAccessToken);
    setUser(newUser);
  };

  const logout = useCallback(async () => {
    authStorageService.clear();
    setAccessToken(null);
    setUser(null);
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
  }, []);

  const isAuthenticated = !!accessToken;

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
