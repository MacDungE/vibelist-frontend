import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 상태만 필요한 경우
export function useAuthStatus() {
  const { state } = useAuth();
  return {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    user: state.user,
    error: state.error,
  };
}

// 인증 액션만 필요한 경우
export function useAuthActions() {
  const { login, logout, refreshToken, checkAuthStatus } = useAuth();
  return { login, logout, refreshToken, checkAuthStatus };
}
