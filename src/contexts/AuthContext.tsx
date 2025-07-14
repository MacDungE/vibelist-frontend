import {createContext} from 'react';
import type {User} from "@/types/user.tsx";

export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loginProvider: string | null;
  login: (provider: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
