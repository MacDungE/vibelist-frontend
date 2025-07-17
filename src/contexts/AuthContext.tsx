import { createContext } from 'react';
import type { User, AuthState, SSOProvider, LoginMethod } from '@/types/auth';

export interface AuthContextType {
  state: AuthState;
  checkAuthStatus: (isInitial?: boolean) => Promise<void>;
  login: (provider: SSOProvider, method?: LoginMethod) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
