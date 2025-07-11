import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    setSelectedProvider('spotify');
    
    // Simulate Spotify OAuth flow
    setTimeout(() => {
      // Mock successful login
      login('spotify', {
        id: 'spotify_user_123',
        name: 'Spotify User',
        email: 'user@spotify.com',
        avatar: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9'
      });
      setIsLoading(false);
      navigate('/settings');
    }, 2000);
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setSelectedProvider('kakao');
    
    // Simulate Kakao OAuth flow
    setTimeout(() => {
      login('kakao', {
        id: 'kakao_user_456',
        name: '카카오 사용자',
        email: 'user@kakao.com',
        avatar: 'https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png'
      });
      setIsLoading(false);
      navigate('/settings');
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setSelectedProvider('google');
    
    // Simulate Google OAuth flow
    setTimeout(() => {
      login('google', {
        id: 'google_user_789',
        name: 'Test User',
        email: 'testuser@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user'
      });
      setIsLoading(false);
      navigate('/settings');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        <div className="w-full flex-1 flex flex-col p-4 min-h-0">
          {/* Header */}
          <div className="text-center mb-8 mt-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] flex items-center justify-center">
              <i className="fas fa-music text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">VibeList</h1>
            <p className="text-gray-600">당신의 감정을 음악으로 표현하세요</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Spotify Login - Primary */}
            <button
              onClick={handleSpotifyLogin}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading && selectedProvider === 'spotify'
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
              }`}
            >
              {isLoading && selectedProvider === 'spotify' ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  <span className="font-medium text-green-700">로그인 중...</span>
                </div>
              ) : (
                <>
                  <i className="fab fa-spotify text-2xl text-green-600"></i>
                  <span className="font-semibold text-green-700">Spotify로 시작하기</span>
                </>
              )}
            </button>

            {/* Kakao Login */}
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading && selectedProvider === 'kakao'
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
              }`}
            >
              {isLoading && selectedProvider === 'kakao' ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="font-medium text-yellow-700">로그인 중...</span>
                </div>
              ) : (
                <>
                  <i className="fas fa-comment text-2xl text-yellow-600"></i>
                  <span className="font-semibold text-yellow-700">카카오로 시작하기</span>
                </>
              )}
            </button>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading && selectedProvider === 'google'
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {isLoading && selectedProvider === 'google' ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span className="font-medium text-gray-700">로그인 중...</span>
                </div>
              ) : (
                <>
                  <i className="fab fa-google text-2xl text-gray-600"></i>
                  <span className="font-semibold text-gray-700">Google로 시작하기</span>
                </>
              )}
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">로그인 안내</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Spotify</strong>: 음악 서비스와 연동하여 플레이리스트를 생성합니다</li>
              <li>• <strong>카카오</strong>: 간편한 소셜 로그인으로 서비스를 이용합니다</li>
              <li>• <strong>Google</strong>: Google 계정으로 빠르게 로그인합니다</li>
            </ul>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              로그인 시 <a href="#" className="text-indigo-600 hover:underline">이용약관</a>과{' '}
              <a href="#" className="text-indigo-600 hover:underline">개인정보처리방침</a>에 동의합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 