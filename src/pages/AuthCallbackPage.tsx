import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ssoService } from '@/services/ssoService';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증을 처리하는 중...');

  // 🔧 중복 실행 방지를 위한 ref
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // 🔧 이미 처리되었으면 중복 실행 방지
      if (hasProcessedRef.current) {
        console.log('이미 인증 처리가 완료되었습니다. 중복 실행을 방지합니다.');
        return;
      }

      try {
        const authStatus = searchParams.get('status');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');
        const tokenId = searchParams.get('token_id'); // 🔑 핵심: 임시 토큰 ID

        if (authStatus === 'success' && tokenId) {
          // 🔧 처리 시작 표시
          hasProcessedRef.current = true;

          setMessage(`${provider || ''} 로그인 성공! 토큰을 처리하는 중...`);

          // 🔐 임시 토큰으로 실제 JWT 토큰 클레임
          const claimResponse = await ssoService.claimTokens(tokenId);

          if (claimResponse.status === 'success') {
            setMessage('토큰 설정 완료! 인증 상태를 확인하는 중...');

            // 🔧 claimTokens 성공 시 자동으로 인증 상태가 설정되므로 별도 확인 불필요
            // await checkAuthStatus();

            setStatus('success');
            setMessage('로그인이 완료되었습니다. 메인 페이지로 이동합니다...');

            setTimeout(() => {
              if (claimResponse.isNewUser) {
                // 신규 사용자는 온보딩 페이지로
                navigate('/onboarding', {
                  replace: true,
                  state: {
                    provider: claimResponse.provider,
                    tempUserId: claimResponse.tempUserId,
                  },
                });
              } else {
                // 기존 사용자는 메인 페이지로
                navigate('/home', { replace: true });
              }
            }, 1500);
          } else {
            throw new Error(claimResponse.message || '토큰 클레임 실패');
          }
        } else {
          // 🔧 처리 시작 표시
          hasProcessedRef.current = true;

          setStatus('error');
          setMessage(`로그인 실패: ${error || '알 수 없는 오류'}`);

          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (err) {
        console.error('콜백 처리 오류:', err);

        // 🔧 처리 시작 표시
        hasProcessedRef.current = true;

        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다.');

        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]); // 🔧 checkAuthStatus 의존성 제거

  return (
    <div
      className='flex min-h-screen w-full items-center justify-center font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='w-full max-w-md space-y-8 p-4 text-center'>
        <div className={`status-icon ${status}`}>
          {status === 'loading' && (
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
            </div>
          )}
          {status === 'success' && (
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <div className='checkmark text-2xl text-green-600'>✓</div>
            </div>
          )}
          {status === 'error' && (
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <div className='error-mark text-2xl text-red-600'>✗</div>
            </div>
          )}
        </div>

        <h2 className='mb-2 text-2xl font-bold'>
          {status === 'loading' && '로그인 처리 중'}
          {status === 'success' && '로그인 성공'}
          {status === 'error' && '로그인 실패'}
        </h2>

        <p className='text-gray-600'>{message}</p>

        {status === 'error' && (
          <button
            className='retry-btn mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600'
            onClick={() => navigate('/login', { replace: true })}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
