import React from 'react';
import DocumentTitle from '@/components/seo/DocumentTitle.tsx';

const LoginPage: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // isAuthenticated 상태를 확인하여 이미 로그인된 경우 다른 페이지로 리디렉션하는 로직은
  // App.tsx나 라우터 레벨에서 처리하는 것이 더 일반적입니다.
  // 여기서는 AuthGuard 컴포넌트가 그 역할을 할 것입니다.

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50'>
      <DocumentTitle title='로그인' />
      <div className='mb-10 text-center'>
        <h1 className='text-4xl font-bold text-gray-800'>VibeList</h1>
        <p className='mt-2 text-lg text-gray-600'>당신의 감정을 음악으로 표현하세요</p>
      </div>
      <div className='w-full max-w-xs space-y-4'>
        <a
          href={`${apiBaseUrl}/oauth2/authorization/google`}
          className='block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-100'
        >
          <i className='fab fa-google mr-2'></i> Google로 로그인
        </a>
        <a
          href={`${apiBaseUrl}/oauth2/authorization/kakao`}
          className='block w-full rounded-lg bg-yellow-400 px-4 py-3 text-center font-semibold text-black shadow-sm transition-all duration-300 hover:bg-yellow-500'
        >
          <i className='fas fa-comment mr-2'></i> 카카오로 로그인
        </a>
        <a
          href={`${apiBaseUrl}/oauth2/authorization/spotify`}
          className='block w-full rounded-lg bg-green-500 px-4 py-3 text-center font-semibold text-white shadow-sm transition-all duration-300 hover:bg-green-600'
        >
          <i className='fab fa-spotify mr-2'></i> Spotify로 로그인
        </a>
      </div>
      <div className='mt-8 text-center'>
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
  );
};

export default LoginPage;
