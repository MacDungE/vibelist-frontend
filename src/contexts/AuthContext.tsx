import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { getCurrentUserInfo } from '@/http/userApi';

export interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshToken?: () => Promise<void>;
  checkAuthStatus?: () => Promise<void>;
}

export type { User };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // 앱 시작 시 localStorage에서 accessToken 불러오기
    return localStorage.getItem('accessToken');
  });

  // 앱 시작 시 현재 사용자 정보 조회
  useEffect(() => {
    setIsLoading(true);
    // accessToken이 있으면 인증 시도
    if (accessToken) {
      getCurrentUserInfo()
        .then(res => {
          const u = res.data;
          setUser({
            id: u.userId,
            username: u.username,
            name: u.name,
            email: u.email,
            avatar: u.avatarUrl,
            provider: '',
          });
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          localStorage.removeItem('accessToken');
        });
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [accessToken]);

  const login = (token: string, user: User) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
    setUser(user);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        user,
        login,
        logout,
        isLoading,
      }}
    >
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
