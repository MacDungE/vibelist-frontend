import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth, useAuthStatus } from '@/hooks/useAuth';
import type { SSOProvider, LoginMethod } from '@/types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isAuthenticated, loading, error } = useAuthStatus();
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('redirect');

  // 이미 로그인된 경우 홈페이지로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to='/home' replace />;
  }

  const handleSocialLogin = async (provider: SSOProvider) => {
    setSelectedProvider(provider);
    try {
      await login(provider, loginMethod);
      // 리다이렉트 방식인 경우 여기 코드는 실행되지 않음
      if (loginMethod === 'popup') {
        navigate('/home');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      setSelectedProvider(null);
    }
  };

  const providerLabels = {
    google: 'Google로 시작하기',
    kakao: '카카오로 시작하기',
    spotify: 'Spotify로 시작하기',
  };

  const providerColors = {
    google: 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    kakao: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300',
    spotify: 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300',
  };

  const providerTextColors = {
    google: 'text-gray-700',
    kakao: 'text-yellow-700',
    spotify: 'text-green-700',
  };

  const providerIcons = {
    google: 'fab fa-google text-gray-600',
    kakao: 'fas fa-comment text-yellow-600',
    spotify: 'fab fa-spotify text-green-600',
  };

  return (
    <div
      className='min-h-screen w-full font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        <div className='flex min-h-0 w-full flex-1 flex-col p-4'>
          {/* Header */}
          <div className='mt-8 mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]'>
              <i className='fas fa-music text-3xl text-white'></i>
            </div>
            <h1 className='mb-2 text-3xl font-bold'>VibeList</h1>
            <p className='text-gray-600'>당신의 감정을 음악으로 표현하세요</p>
          </div>

          {/* 로그인 방식 선택 */}
          <div className='mb-6 flex justify-center space-x-4'>
            <label className='flex items-center'>
              <input
                type='radio'
                value='redirect'
                checked={loginMethod === 'redirect'}
                onChange={e => setLoginMethod(e.target.value as LoginMethod)}
                className='mr-2'
                disabled={loading}
              />
              <span className='text-sm'>리다이렉트</span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                value='popup'
                checked={loginMethod === 'popup'}
                onChange={e => setLoginMethod(e.target.value as LoginMethod)}
                className='mr-2'
                disabled={loading}
              />
              <span className='text-sm'>팝업</span>
            </label>
          </div>

          {/* Login Options */}
          <div className='space-y-4'>
            {(['spotify', 'kakao', 'google'] as const).map(provider => (
              <button
                key={provider}
                onClick={() => handleSocialLogin(provider)}
                disabled={loading}
                className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all duration-300 ${
                  loading && selectedProvider === provider
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100'
                    : providerColors[provider]
                } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {loading && selectedProvider === provider ? (
                  <div className='flex items-center gap-3'>
                    <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-current'></div>
                    <span className='font-medium'>로그인 중...</span>
                  </div>
                ) : (
                  <>
                    <i className={`${providerIcons[provider]} text-2xl`}></i>
                    <span className={`font-semibold ${providerTextColors[provider]}`}>
                      {providerLabels[provider]}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3'>
              <p className='text-center text-sm text-red-600'>{error}</p>
            </div>
          )}

          {/* Info Section */}
          <div className='mt-8 rounded-xl bg-gray-50 p-4'>
            <h3 className='mb-2 font-semibold text-gray-800'>로그인 안내</h3>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>
                • <strong>Spotify</strong>: 음악 서비스와 연동하여 플레이리스트를 생성합니다
              </li>
              <li>
                • <strong>카카오</strong>: 간편한 소셜 로그인으로 서비스를 이용합니다
              </li>
              <li>
                • <strong>Google</strong>: Google 계정으로 빠르게 로그인합니다
              </li>
            </ul>
          </div>

          {/* Terms */}
          <div className='mt-6 text-center'>
            <p className='text-xs text-gray-500'>
              로그인 시{' '}
              <a href='#' className='text-indigo-600 hover:underline'>
                이용약관
              </a>
              과{' '}
              <a href='#' className='text-indigo-600 hover:underline'>
                개인정보처리방침
              </a>
              에 동의합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
