import { useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserInfo } from '@/http/userApi';
import { socialLoginCallback } from '@/http/authApi';
import { authStorageService } from '@/services/authStorageService';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(
    async (initialToken: string) => {
      try {
        // 1. initialToken으로 백엔드에 콜백 요청을 보내 새 accessToken을 받습니다.
        //    이 과정에서 서버는 httpOnly 쿠키(리프레시 토큰)를 설정합니다.
        const { data } = await socialLoginCallback(initialToken);
        const newAccessToken = data.accessToken;
        debugger;
        // 2. 새로 받은 accessToken을 스토리지에 저장합니다.
        authStorageService.setAccessToken(newAccessToken);

        // 3. 사용자 정보를 조회합니다.
        const userResponse = await getCurrentUserInfo();

        // 4. 로그인 처리 후 홈으로 이동합니다.
        login(newAccessToken, userResponse.data);
        navigate('/', { replace: true });
      } catch (error) {
        console.error('로그인 처리 중 오류가 발생했습니다:', error);
        // 오류 발생 시 저장했던 토큰을 삭제하고 로그인 페이지로 보냅니다.
        authStorageService.clear();
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
        `/social-signup?provider=${provider}&tempUserInfo=${encodeURIComponent(
          tempUserInfo || ''
        )}`,
        {
          replace: true,
        }
      );
    } else {
      console.error('인증 콜백 오류: accessToken 또는 isNewUser 파라미터가 없습니다.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, handleLogin]);

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
