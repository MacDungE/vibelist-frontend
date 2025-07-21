import { useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserInfo } from '@/http/userApi';
import { authStorageService } from '@/services/authStorageService';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(
    async (token: string) => {
      authStorageService.setAccessToken(token); // API 호출 전에 토큰을 먼저 설정
      try {
        const userResponse = await getCurrentUserInfo();
        login(token, userResponse.data);
        navigate('/', { replace: true });
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        navigate('/login', { replace: true });
      }
    },
    [navigate, login]
  );

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const provider = searchParams.get('provider');
    const tempUserInfo = searchParams.get('tempUserInfo');

    if (accessToken) {
      handleLogin(accessToken);
    } else if (isNewUser) {
      navigate(
        `/social-signup?provider=${provider}&tempUserInfo=${encodeURIComponent(tempUserInfo || '')}`,
        {
          replace: true,
        }
      );
    } else {
      console.error('인증 콜백 오류: accessToken 또는 isNewUser 파라미터가 없습니다.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, login]);

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
