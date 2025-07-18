import React, { useEffect, useRef, useState } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const hasCheckedRef = useRef(false);

  // 초기 인증 상태 확인 (한 번만)
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasCheckedRef.current) return;

      hasCheckedRef.current = true;
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('AuthGuard: 초기 인증 상태 확인 실패:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    // 로딩이 완료되면 초기화 완료로 간주
    if (!loading && !isInitialized) {
      setIsInitialized(true);
    } else if (loading && !hasCheckedRef.current) {
      initializeAuth();
    }
  }, [loading, checkAuthStatus, isInitialized]);

  // 디버깅을 위한 로그
  console.log('AuthGuard Debug:', {
    requireAuth,
    isAuthenticated,
    loading,
    isInitialized,
    currentPath: location.pathname,
  });

  // 초기화가 완료되지 않았으면 로딩 화면 표시
  if (!isInitialized || loading) {
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
