import React from 'react';
import { useAuthStatus } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

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
    return <Navigate to={redirectTo} replace />;
  }

  // 인증이 필요하지 않은 페이지인데 이미 로그인한 경우 (로그인 페이지 등)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to='/home' replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
