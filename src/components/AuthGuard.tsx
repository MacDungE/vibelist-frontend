import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 최초 인증 상태 확인 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-dashed border-blue-500'></div>
      </div>
    );
  }

  // --- 인증 로직 ---

  // 1. 인증이 필요한 페이지에 접근했으나, 로그인되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    // 사용자를 로그인 페이지로 리디렉션합니다.
    // 사용자가 원래 가려던 경로를 state에 저장하여 로그인 후 해당 경로로 이동시킬 수 있습니다.
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 2. 인증이 필요 없는 페이지(예: 로그인, 회원가입)에 접근했으나, 이미 로그인된 경우
  if (!requireAuth && isAuthenticated) {
    // 사용자를 메인 페이지로 리디렉션합니다.
    return <Navigate to='/' replace />;
  }

  // 3. 그 외의 모든 경우 (접근 허용)
  return <>{children}</>;
};

export default AuthGuard;
