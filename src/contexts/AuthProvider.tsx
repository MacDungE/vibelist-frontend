import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType, type User } from '@/contexts/AuthContext';
import apiClient from '@/http/client';
import { authStorageService } from '@/services/authStorageService';
import { getCurrentUserInfo } from '@/http/userApi';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    authStorageService.getAccessToken()
  );
  const [user, setUser] = useState<User | null>(authStorageService.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 앱 시작 시 현재 사용자 정보 조회
  useEffect(() => {
    setIsLoading(true);
    getCurrentUserInfo()
      .then(res => {
        const u = res.data;
        const userObj: User = {
          id: u.userId,
          username: u.username,
          name: u.name,
          email: u.email,
          avatar: u.avatarUrl,
          provider: '',
        };
        setUser(userObj);
        authStorageService.setUser(userObj);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        authStorageService.setUser(null as any);
        setIsLoading(false);
      });
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

  const isAuthenticated = !!accessToken && !!user && !!user.username;

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
