import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import {
  useAuthStatus as useAuthStatusQuery,
  useRefreshToken as useRefreshTokenMutation,
  useLogout as useLogoutMutation,
} from '@/queries';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 상태만 필요한 경우 (TanStack Query 사용)
export function useAuthStatus() {
  const { data, isLoading, error } = useAuthStatusQuery();

  return {
    isAuthenticated: data?.data?.authenticated ?? false,
    loading: isLoading,
    user: data?.data,
    error: error,
  };
}

// 인증 액션만 필요한 경우
export function useAuthActions() {
  const { login, logout, refreshToken, checkAuthStatus } = useAuth();
  const refreshTokenMutation = useRefreshTokenMutation();
  const logoutMutation = useLogoutMutation();

  return {
    login,
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    checkAuthStatus,
  };
}

// 주기적인 인증 상태 모니터링 (선택적 사용)
export function useAuthMonitor(intervalMs: number = 5 * 60 * 1000) {
  // 기본 5분
  const { checkAuthStatus } = useAuthActions();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 주기적으로 인증 상태 확인
    intervalRef.current = setInterval(() => {
      checkAuthStatus().catch(error => {
        console.error('주기적 인증 상태 확인 실패:', error);
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAuthStatus, intervalMs]);

  return {
    stopMonitoring: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
  };
}
