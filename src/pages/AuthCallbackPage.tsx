import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const authStatus = searchParams.get('status');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');
        const tempUserId = searchParams.get('tempUserId');

        if (authStatus === 'success') {
          // 인증 상태 재확인
          await checkAuthStatus();

          if (tempUserId) {
            // 신규 사용자인 경우 회원가입 페이지로
            setMessage(`${provider} 계정으로 회원가입이 필요합니다.`);
            setTimeout(
              () => navigate(`/signup?tempUserId=${tempUserId}&provider=${provider}`),
              2000
            );
          } else {
            // 기존 사용자인 경우 홈페이지로
            setMessage(`${provider} 로그인 성공!`);
            setStatus('success');
            setTimeout(() => navigate('/home'), 2000);
          }
        } else {
          setStatus('error');
          setMessage(error || '로그인 중 오류가 발생했습니다.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('콜백 처리 중 오류:', err);
        setStatus('error');
        setMessage('인증 처리 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuthStatus]);

  return (
    <div
      className='flex min-h-screen w-full items-center justify-center font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='w-full max-w-md space-y-8 p-4 text-center'>
        {status === 'loading' && (
          <>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
            </div>
            <h2 className='mb-2 text-2xl font-bold'>로그인 처리 중</h2>
            <p className='text-gray-600'>잠시만 기다려주세요...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <i className='fas fa-check text-2xl text-green-600'></i>
            </div>
            <h2 className='mb-2 text-2xl font-bold text-green-600'>로그인 성공</h2>
            <p className='text-gray-600'>{message}</p>
            <p className='text-sm text-gray-500'>잠시 후 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <i className='fas fa-times text-2xl text-red-600'></i>
            </div>
            <h2 className='mb-2 text-2xl font-bold text-red-600'>로그인 실패</h2>
            <p className='text-gray-600'>{message}</p>
            <p className='text-sm text-gray-500'>로그인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
