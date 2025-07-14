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
import {AuthProvider} from "@/contexts/AuthProvider.tsx";
import {PostsProvider} from "@/contexts/PostsProvider.tsx";

function useViewportHeightVar() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--app-viewport-height', `${window.innerHeight}px`);
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
          className="w-full font-['Inter'] flex flex-col"
          style={{
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            height: 'var(--app-viewport-height)',
            minHeight: '0',
          }}
        >
          {/* 헤더 */}
          <div className="w-full" style={{ background: 'var(--surface)', height: 'var(--header-height, 5rem)' }}>
            <div className="max-w-[1440px] mx-auto px-4 md:px-6">
              <Header />
            </div>
          </div>
          {/* 메인 컨텐츠 */}
          <main
            className="w-full flex-1 flex flex-col items-center justify-center"
            style={{
              height: 'calc(var(--app-viewport-height) - var(--footer-height, 6rem))',
              overflow: 'auto',
              minHeight: 0,
            }}
            id="main-content"
          >
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col flex-1 min-h-0">
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/feed" element={<ExplorePage />} />
                <Route path="/create" element={<AuthGuard><PostCreatePage /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                <Route path="/user/:username" element={<AuthGuard><UserProfilePage /></AuthGuard>} />
                <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                <Route path="/playlist-result" element={<AuthGuard><PlaylistResultPage /></AuthGuard>} />
                <Route path="/login" element={<AuthGuard requireAuth={false}><LoginPage /></AuthGuard>} />
                <Route path="*" element={<HomePage />} />
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
