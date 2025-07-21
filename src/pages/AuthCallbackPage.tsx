import { useCallback, useEffect, useRef } from 'react';
import { useMountedState } from 'react-use';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserInfo } from '@/http/userApi';
import { authStorageService } from '@/services/authStorageService';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMounted = useMountedState();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isProcessingRef = useRef(false);

  const handleLogin = useCallback(
    async (accessToken: string) => {
      // 중복 호출 방지
      if (isProcessingRef.current) {
        console.warn('Login already in progress, skipping duplicate request');
        return;
      }

      isProcessingRef.current = true;
      abortControllerRef.current = new AbortController();

      try {
        authStorageService.setAccessToken(accessToken);

        // 3. 사용자 정보를 조회합니다.
        const userResponse = await getCurrentUserInfo();

        // 컴포넌트가 언마운트되었거나 요청이 취소된 경우 처리 중단
        if (!isMounted() || abortControllerRef.current.signal.aborted) {
          return;
        }

        // 4. 로그인 처리 후 홈으로 이동합니다.
        login(accessToken, userResponse.data);
        navigate('/', { replace: true });
      } catch (error) {
        console.error('로그인 처리 중 오류가 발생했습니다:', error);
        // 오류 발생 시 저장했던 토큰을 삭제하고 로그인 페이지로 보냅니다.
        authStorageService.clear();
        navigate('/login', { replace: true });
      } finally {
        isProcessingRef.current = false;
      }
    },
    [navigate, login]
  );

  useEffect(() => {
    // 컴포넌트 언마운트 시 진행 중인 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const provider = searchParams.get('provider');
    const tempUserInfo = searchParams.get('tempUserInfo');

    if (accessToken && !isProcessingRef.current) {
      handleLogin(accessToken);
    } else if (isNewUser) {
      navigate(
        `/social-signup?provider=${provider}&tempUserInfo=${encodeURIComponent(
          tempUserInfo || ''
        )}`,
        {
          replace: true,
        }
      );
    } else if (!accessToken && !isNewUser) {
      console.error('인증 콜백 오류: accessToken 또는 isNewUser 파라미터가 없습니다.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, handleLogin, navigate]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-dashed border-blue-500'></div>
        <p className='text-lg font-semibold text-gray-700'>로그인 처리 중...</p>
        <p className='text-sm text-gray-500'>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
