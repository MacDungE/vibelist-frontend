import React, { useEffect, useRef } from 'react';
import { useAuthStatus, useAuthActions } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, loading } = useAuthStatus();
  const { checkAuthStatus } = useAuthActions();
  const location = useLocation();
  const lastCheckRef = useRef<number>(0);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 페이지 이동 시마다 인증 상태 확인 (디바운싱 적용)
  useEffect(() => {
    const verifyAuthStatus = async () => {
      try {
        await checkAuthStatus();
        lastCheckRef.current = Date.now();
      } catch (error) {
        console.error('AuthGuard: 인증 상태 확인 실패:', error);
      }
    };

    // 이전 체크로부터 2초가 지나지 않았으면 스킵 (디바운싱)
    const timeSinceLastCheck = Date.now() - lastCheckRef.current;
    if (timeSinceLastCheck < 2000) {
      console.log('AuthGuard: 최근에 상태를 확인했으므로 스킵');
      return;
    }

    // 로딩 중이 아닐 때만 상태 확인 (중복 호출 방지)
    if (!loading) {
      // 기존 타이머가 있으면 클리어
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // 300ms 디바운싱
      checkTimeoutRef.current = setTimeout(() => {
        verifyAuthStatus();
      }, 300);
    }

    // 클린업 함수
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [location.pathname, checkAuthStatus, loading]);

  // 디버깅을 위한 로그
  console.log('AuthGuard Debug:', {
    requireAuth,
    isAuthenticated,
    loading,
    currentPath: location.pathname,
  });

  if (loading) {
    return (
      <div
        className='flex min-h-screen w-full items-center justify-center font-sans'
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        <div className='text-center'>
          <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#4A6CF7]'></div>
          <p className='text-sm text-gray-500'>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    console.log('AuthGuard: 인증 필요하지만 로그인되지 않음, 리다이렉트:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // 인증이 필요하지 않은 페이지인데 이미 로그인한 경우 (로그인 페이지 등)
  if (!requireAuth && isAuthenticated) {
    console.log('AuthGuard: 이미 로그인됨, 홈으로 리다이렉트');
    return <Navigate to='/home' replace />;
  }

  console.log('AuthGuard: 인증 통과, 페이지 렌더링');
  return <>{children}</>;
};

export default AuthGuard;
