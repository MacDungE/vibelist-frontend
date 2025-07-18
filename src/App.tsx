import { Routes, Route } from 'react-router-dom';
import Header from '@/components/layout/Header';

import HomePage from '@/pages/HomePage';

import ProfilePage from '@/pages/ProfilePage';
import PlaylistResultPage from '@/pages/PlaylistResultPage';
import BottomNav from '@/components/common/BottomNav';
import ExplorePage from '@/pages/ExplorePage';
import PostCreatePage from '@/pages/PostCreatePage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import AuthGuard from '@/components/AuthGuard';
import { useEffect } from 'react';
import UserProfilePage from '@/pages/UserProfilePage';
import { AuthProvider } from '@/contexts/AuthProvider.tsx';
import { PostsProvider } from '@/contexts/PostsProvider.tsx';
import { QueryProvider } from '@/contexts/QueryProvider';
import { useAuthMonitor } from '@/hooks/useAuth';

function useViewportHeightVar() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        '--app-viewport-height',
        `${window.innerHeight}px`
      );
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);
}

function AppContent() {
  useViewportHeightVar();

  // 전역 인증 상태 모니터링 (10분마다)
  useAuthMonitor(10 * 60 * 1000);

  return (
    <div
      className="grid min-h-dvh w-full grid-rows-[auto_minmax(min-content,1fr)] font-['Inter']"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* 헤더 */}
      <Header />
      {/* 메인 컨텐츠 */}
      <main className='w-full'>
        <div className='container mx-auto flex w-full flex-1 flex-col px-4 pt-4 md:px-6'>
          <Routes>
            {/* 기본 라우트 */}
            <Route path='/' element={<HomePage />} />
            <Route path='/home' element={<HomePage />} />
            <Route path='/explore' element={<ExplorePage />} />
            <Route path='/feed' element={<ExplorePage />} />

            {/* 인증 관련 라우트 */}
            <Route
              path='/login'
              element={
                <AuthGuard requireAuth={false}>
                  <LoginPage />
                </AuthGuard>
              }
            />
            <Route path='/auth/callback' element={<AuthCallbackPage />} />
            <Route path='/auth/signup' element={<AuthCallbackPage />} />
            <Route path='/auth/integration' element={<AuthCallbackPage />} />
            <Route path='/auth/error' element={<AuthCallbackPage />} />

            {/* 보호된 라우트 */}
            <Route
              path='/create'
              element={
                <AuthGuard>
                  <PostCreatePage />
                </AuthGuard>
              }
            />
            <Route
              path='/profile'
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path='/user/:username'
              element={
                <AuthGuard>
                  <UserProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path='/settings'
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
            <Route
              path='/setting'
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
            <Route
              path='/playlist-result'
              element={
                <AuthGuard>
                  <PlaylistResultPage />
                </AuthGuard>
              }
            />

            {/* 404 페이지 */}
            <Route path='*' element={<HomePage />} />
          </Routes>
        </div>
      </main>
      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <PostsProvider>
          <AppContent />
        </PostsProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
