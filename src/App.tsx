import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/common/BottomNav';
import AuthGuard from '@/components/AuthGuard';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ProfilePage from '@/pages/ProfilePage';
import ExplorePage from '@/pages/ExplorePage';
import PostCreatePage from '@/pages/PostCreatePage';
import SettingsPage from '@/pages/SettingsPage';
import UserProfilePage from '@/pages/UserProfilePage';
import PlaylistResultPage from '@/pages/PlaylistResultPage';
// import SocialSignupPage from '@/pages/SocialSignupPage'; // TODO: 이 페이지를 생성해야 합니다.

// 화면 높이를 CSS 변수로 설정하는 훅
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
    <div
      className="grid min-h-dvh w-full grid-rows-[auto_minmax(min-content,1fr)] font-['Inter']"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      <Header />
      <main className='w-full'>
        <div className='container mx-auto flex w-full flex-1 flex-col px-4 pt-4 md:px-6'>
          <Routes>
            {/* 공개 경로 */}
            <Route
              path='/login'
              element={
                <AuthGuard requireAuth={false}>
                  <LoginPage />
                </AuthGuard>
              }
            />
            <Route path='/oauth/callback' element={<AuthCallbackPage />} />

            {/* TODO: 신규 사용자 등록 페이지 생성 후 아래 라우트 활성화 */}
            {/* <Route 
              path="/social-signup" 
              element={
                <AuthGuard requireAuth={false}>
                  <SocialSignupPage />
                </AuthGuard>
              } 
            /> */}

            {/* 공개 경로 - 로그인 없이 접근 가능 */}
            <Route path='/' element={<HomePage />} />
            <Route path='/explore' element={<ExplorePage />} />
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

            {/* 404 페이지 대체 */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
