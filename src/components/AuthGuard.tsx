import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '../pages/LoginPage';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full font-sans flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isLoggedIn) {
    return <LoginPage />;
  }

  if (!requireAuth && isLoggedIn) {
    // If user is logged in and trying to access login page, redirect to settings
    window.location.href = '/settings';
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard; 