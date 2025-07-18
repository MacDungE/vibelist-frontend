import React, { type ReactNode, useEffect, useReducer, useCallback, useRef } from 'react';
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext';
import type { User, AuthState, SSOProvider, LoginMethod } from '@/types/auth';
import { ssoService } from '@/services/ssoService';

interface AuthProviderProps {
  children: ReactNode;
}

// 액션 타입 정의
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_INITIAL_CHECK' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET' };

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // 초기 로딩 상태
  error: null,
};

// 리듀서
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_INITIAL_CHECK':
      // 초기 인증 상태 확인 시에는 loading 상태를 유지하되 error는 클리어
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'AUTH_RESET':
      return initialState;
    default:
      return state;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isCheckingRef = useRef(false);
  const hasMountedRef = useRef(false);

  // 인증 상태 확인
  const checkAuthStatus = useCallback(async (isInitial: boolean = false) => {
    // 이미 확인 중이면 중복 호출 방지
    if (isCheckingRef.current) {
      console.log('이미 인증 상태 확인 중입니다. 중복 호출을 방지합니다.');
      return;
    }

    isCheckingRef.current = true;
    console.log('AuthProvider: 인증 상태 확인 시작, isInitial:', isInitial);

    try {
      // 초기 체크일 때는 loading 상태를 변경하지 않음
      dispatch({ type: isInitial ? 'AUTH_INITIAL_CHECK' : 'AUTH_START' });
      const status = await ssoService.getStatus();

      console.log('AuthProvider: 서버 응답:', status);

      if (status.authenticated && status.userId) {
        const user: User = {
          id: status.userId,
          username: status.username || '',
          email: status.email || '',
          name: status.name || '',
          provider: status.provider || 'jwt',
        };
        console.log('AuthProvider: 인증 성공, 사용자:', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        console.log('AuthProvider: 인증 실패, 상태:', status);
        dispatch({ type: 'AUTH_FAILURE', payload: isInitial ? '' : '인증되지 않았습니다.' });
      }
    } catch (error: any) {
      console.error('AuthProvider: 인증 상태 확인 중 오류:', error);

      // 401 에러는 정상적인 "인증되지 않음" 상태
      if (error.response?.status === 401) {
        console.log('AuthProvider: 401 에러 - 인증되지 않음');
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
        return;
      }

      // 네트워크 에러나 기타 서버 에러
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.log('AuthProvider: 네트워크 에러 - 현재 상태 유지');
        // 네트워크 에러 시에는 현재 상태를 유지하고 에러만 표시하지 않음
        if (!isInitial) {
          dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
        return;
      }

      // 초기 체크 시에는 네트워크 에러 등을 표시하지 않음
      const errorMessage = isInitial ? '' : '인증 상태 확인 실패';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  // 소셜 로그인 (보안 강화된 리다이렉트 방식)
  const login = useCallback(async (provider: SSOProvider, method: LoginMethod = 'redirect') => {
    try {
      dispatch({ type: 'AUTH_START' });

      // 새로운 보안 강화된 방식은 리다이렉트만 지원
      await ssoService.login(provider);

      // 리다이렉트가 발생하므로 이 코드는 실행되지 않음
      // 실제 인증 상태 확인은 AuthCallbackPage에서 처리됨
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : '로그인 실패',
      });
      throw error; // 에러를 다시 던져서 컴포넌트에서 처리할 수 있도록 함
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await ssoService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 로그아웃은 실패해도 클라이언트 상태는 초기화
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // 토큰 갱신
  const refreshToken = useCallback(async () => {
    try {
      await ssoService.refreshToken();
      await checkAuthStatus();
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: '토큰 갱신 실패' });
    }
  }, [checkAuthStatus]);

  // 초기 인증 상태 확인 (마운트 시에만 한 번)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      checkAuthStatus(true);
    }
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    state,
    user: state.user,
    loginProvider: state.user?.provider || 'unknown',
    checkAuthStatus,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
