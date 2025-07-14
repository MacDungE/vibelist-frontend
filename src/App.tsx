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
import AuthGuard from '@/components/AuthGuard';
import { useEffect } from 'react';
import UserProfilePage from '@/pages/UserProfilePage';
import { AuthProvider } from '@/contexts/AuthProvider.tsx';
import { PostsProvider } from '@/contexts/PostsProvider.tsx';

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

function App() {
  useViewportHeightVar();

  return (
    <AuthProvider>
      <PostsProvider>
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
                <Route path='/home' element={<HomePage />} />
                <Route path='/explore' element={<ExplorePage />} />
                <Route path='/feed' element={<ExplorePage />} />
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
                  path='/playlist-result'
                  element={
                    <AuthGuard>
                      <PlaylistResultPage />
                    </AuthGuard>
                  }
                />
                <Route
                  path='/login'
                  element={
                    <AuthGuard requireAuth={false}>
                      <LoginPage />
                    </AuthGuard>
                  }
                />
                <Route path='*' element={<HomePage />} />
              </Routes>
            </div>
          </main>
          {/* 하단 네비게이션 */}
          <BottomNav />
        </div>
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;
