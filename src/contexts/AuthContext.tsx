import { createContext, useContext } from 'react';
import type { User } from '@/types/user';

export interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
