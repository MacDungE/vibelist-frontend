# React SSO 통합 가이드 (Vite)

## 개요

이 가이드는 **React + Vite** 환경에서 VibeList Backend의 SSO(Single Sign-On) 기능을 통합하는 방법을 설명합니다. Google, Kakao, Spotify 소셜 로그인과 JWT 기반 인증을 지원합니다.

## 백엔드 요구사항

### ✅ 이미 구현된 기능들
- `OAuth2LoginSuccessHandler`: React 앱으로 리다이렉트
- `SSOController`: React 전용 API 엔드포인트
- `SSOStatusResponse`: 인증 상태 응답 DTO
- `EnhancedCookieUtil`: 크로스 도메인 쿠키 지원
- `WebConfig`: CORS 설정

### 백엔드 API 엔드포인트

| HTTP Method | 엔드포인트 | 설명 | 응답 타입 |
|------------|-----------|------|----------|
| `GET` | `/v1/sso/login-urls` | 소셜 로그인 URL 목록 조회 | `Map<String, String>` |
| `GET` | `/v1/sso/status` | 인증 상태 확인 | `SSOStatusResponse` |
| `POST` | `/v1/sso/refresh` | 토큰 갱신 | `Map<String, String>` |
| `POST` | `/v1/sso/logout` | 로그아웃 | `Map<String, String>` |
| `GET` | `/v1/sso/callback` | OAuth2 콜백 처리 | `Redirect` |

---

## React 프로젝트 설정

### 1. 프로젝트 생성 및 의존성 설치

```bash
# Vite로 React 프로젝트 생성
npm create vite@latest my-vibelist-app -- --template react-ts
cd my-vibelist-app

# 필요한 의존성 설치
npm install axios react-router-dom
npm install -D @types/node

# 개발 서버 실행
npm run dev
```

### 2. 환경변수 설정

#### `.env.development`
```env
# 개발환경 설정
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_BASE_URL=http://localhost:3000
```

#### `.env.production`
```env
# 운영환경 설정
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_BASE_URL=https://yourdomain.com
```

### 3. Vite 설정 (개발 서버)

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 백엔드와의 CORS 문제 해결을 위한 프록시 설정 (선택사항)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // 환경변수 타입 지원
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
```

---

## SSO 서비스 구현

### 1. API 클라이언트 설정

#### `src/services/api.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 포함 요청 필수
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API 요청:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API 응답 에러:', error.response?.status, error.config?.url);
    
    // 401 에러 시 토큰 갱신 시도
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true;
      
      try {
        await apiClient.post('/v1/sso/refresh');
        // 토큰 갱신 성공 시 원래 요청 재시도
        return apiClient.request(error.config);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. SSO 타입 정의

#### `src/types/auth.ts`
```typescript
// SSO 상태 응답 타입
export interface SSOStatusResponse {
  authenticated: boolean;
  userId?: number;
  username?: string;
  email?: string;
  name?: string;
  provider?: string;
  checkedAt: string;
}

// 소셜 로그인 URL 응답 타입
export interface SocialLoginUrls {
  google: string;
  kakao: string;
  spotify: string;
}

// 사용자 정보 타입
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  provider: string;
}

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### 3. SSO 서비스 클래스

#### `src/services/ssoService.ts`
```typescript
import apiClient from './api';
import { SSOStatusResponse, SocialLoginUrls } from '../types/auth';

class SSOService {
  /**
   * 소셜 로그인 URL 목록 조회
   */
  async getLoginUrls(redirectUrl?: string): Promise<SocialLoginUrls> {
    const params = redirectUrl ? { redirectUrl } : {};
    const response = await apiClient.get('/v1/sso/login-urls', { params });
    return response.data;
  }

  /**
   * 인증 상태 확인
   */
  async getStatus(): Promise<SSOStatusResponse> {
    const response = await apiClient.get('/v1/sso/status');
    return response.data;
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<{ status: string; message: string }> {
    const response = await apiClient.post('/v1/sso/refresh');
    return response.data;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<{ status: string; message: string }> {
    const response = await apiClient.post('/v1/sso/logout');
    return response.data;
  }

  /**
   * 소셜 로그인 시작 (팝업 방식)
   */
  async startSocialLogin(provider: 'google' | 'kakao' | 'spotify'): Promise<void> {
    const urls = await this.getLoginUrls();
    const loginUrl = `${import.meta.env.VITE_API_BASE_URL}${urls[provider]}`;
    
    // 팝업 창으로 소셜 로그인 시작
    const popup = window.open(
      loginUrl,
      'social-login',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // 팝업 모니터링
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // 팝업이 닫히면 인증 상태 확인
          this.getStatus()
            .then((status) => {
              if (status.authenticated) {
                resolve();
              } else {
                reject(new Error('로그인이 취소되었습니다.'));
              }
            })
            .catch(reject);
        }
      }, 1000);

      // 10분 후 타임아웃
      setTimeout(() => {
        clearInterval(checkClosed);
        popup?.close();
        reject(new Error('로그인 시간이 초과되었습니다.'));
      }, 600000);
    });
  }

  /**
   * 리다이렉트 방식 소셜 로그인
   */
  async redirectToSocialLogin(provider: 'google' | 'kakao' | 'spotify'): Promise<void> {
    const urls = await this.getLoginUrls(window.location.origin + '/auth/callback');
    const loginUrl = `${import.meta.env.VITE_API_BASE_URL}${urls[provider]}`;
    window.location.href = loginUrl;
  }
}

export const ssoService = new SSOService();
export default SSOService;
```

---

## React Context 및 Hook

### 1. 인증 Context

#### `src/contexts/AuthContext.tsx`
```typescript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';
import { ssoService } from '../services/ssoService';

// 액션 타입 정의
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET' };

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// 리듀서
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
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

// Context 타입
interface AuthContextType {
  state: AuthState;
  checkAuthStatus: () => Promise<void>;
  login: (provider: 'google' | 'kakao' | 'spotify', method?: 'popup' | 'redirect') => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const status = await ssoService.getStatus();
      
      if (status.authenticated && status.userId) {
        const user: User = {
          id: status.userId,
          username: status.username || '',
          email: status.email || '',
          name: status.name || '',
          provider: status.provider || 'jwt',
        };
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: '인증되지 않았습니다.' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: '인증 상태 확인 실패' });
    }
  };

  // 소셜 로그인
  const login = async (
    provider: 'google' | 'kakao' | 'spotify',
    method: 'popup' | 'redirect' = 'redirect'
  ) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      if (method === 'popup') {
        await ssoService.startSocialLogin(provider);
      } else {
        await ssoService.redirectToSocialLogin(provider);
      }
      
      // 로그인 성공 후 인증 상태 재확인
      await checkAuthStatus();
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : '로그인 실패' 
      });
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await ssoService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 로그아웃은 실패해도 클라이언트 상태는 초기화
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // 토큰 갱신
  const refreshToken = async () => {
    try {
      await ssoService.refreshToken();
      await checkAuthStatus();
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: '토큰 갱신 실패' });
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    state,
    checkAuthStatus,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 2. 인증 훅

#### `src/hooks/useAuth.ts`
```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 인증 상태만 필요한 경우
export function useAuthStatus() {
  const { state } = useAuth();
  return {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    user: state.user,
    error: state.error,
  };
}

// 인증 액션만 필요한 경우  
export function useAuthActions() {
  const { login, logout, refreshToken, checkAuthStatus } = useAuth();
  return { login, logout, refreshToken, checkAuthStatus };
}
```

---

## React 컴포넌트 구현

### 1. 로그인 페이지

#### `src/pages/LoginPage.tsx`
```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { state, login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'popup' | 'redirect'>('redirect');

  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'spotify') => {
    try {
      await login(provider, loginMethod);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const providerLabels = {
    google: 'Google로 로그인',
    kakao: 'Kakao로 로그인',
    spotify: 'Spotify로 로그인',
  };

  const providerColors = {
    google: 'bg-red-500 hover:bg-red-600',
    kakao: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    spotify: 'bg-green-500 hover:bg-green-600',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VibeList에 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* 로그인 방식 선택 */}
          <div className="flex justify-center space-x-4 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="redirect"
                checked={loginMethod === 'redirect'}
                onChange={(e) => setLoginMethod(e.target.value as 'redirect')}
                className="mr-2"
              />
              리다이렉트
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="popup"
                checked={loginMethod === 'popup'}
                onChange={(e) => setLoginMethod(e.target.value as 'popup')}
                className="mr-2"
              />
              팝업
            </label>
          </div>

          {/* 소셜 로그인 버튼들 */}
          {(['google', 'kakao', 'spotify'] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => handleSocialLogin(provider)}
              disabled={state.loading}
              className={`
                group relative w-full flex justify-center py-3 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white transition-colors duration-200
                ${providerColors[provider]}
                ${state.loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {state.loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                providerLabels[provider]
              )}
            </button>
          ))}

          {/* 에러 메시지 */}
          {state.error && (
            <div className="mt-4 text-center text-red-600 text-sm">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### 2. 콜백 페이지

#### `src/pages/AuthCallbackPage.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
            setTimeout(() => navigate(`/signup?tempUserId=${tempUserId}&provider=${provider}`), 2000);
          } else {
            // 기존 사용자인 경우 대시보드로
            setMessage(`${provider} 로그인 성공!`);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg text-gray-600">로그인 처리 중...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl">✓</div>
            <p className="text-lg text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">잠시 후 이동합니다...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 text-6xl">✗</div>
            <p className="text-lg text-red-600">{message}</p>
            <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
```

### 3. 대시보드 (보호된 페이지)

#### `src/pages/DashboardPage.tsx`
```typescript
import React from 'react';
import { useAuthStatus, useAuthActions } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuthStatus();
  const { logout } = useAuthActions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <a href="/login" className="text-blue-600 hover:underline">
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">VibeList Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">안녕하세요, {user.name || user.username}님!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 사용자 정보 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  사용자 정보
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>사용자명:</strong> {user.username}</p>
                    <p><strong>이메일:</strong> {user.email}</p>
                    <p><strong>이름:</strong> {user.name}</p>
                    <p><strong>제공자:</strong> {user.provider}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 플레이리스트 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  나의 플레이리스트
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>플레이리스트 기능을 구현하세요.</p>
                </div>
              </div>
            </div>

            {/* 음악 추천 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  음악 추천
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>AI 기반 음악 추천 기능을 구현하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
```

### 4. 보호된 라우트 컴포넌트

#### `src/components/ProtectedRoute.tsx`
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading } = useAuthStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

## 라우터 설정

### `src/App.tsx`
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 기본 라우트 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 인증 관련 라우트 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/signup" element={<AuthCallbackPage />} />
            <Route path="/auth/integration" element={<AuthCallbackPage />} />
            <Route path="/auth/error" element={<AuthCallbackPage />} />
            
            {/* 보호된 라우트 */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 페이지 */}
            <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## Tailwind CSS 설정 (선택사항)

### 1. Tailwind 설치
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 커스텀 스타일 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 배포 설정

### 1. 운영환경 환경변수

#### `Dockerfile` (선택사항)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (선택사항)
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 빌드 스크립트

#### `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 테스트

### 1. 개발환경 테스트

```bash
# 백엔드 실행 (8080 포트)
cd vibelist-backend
./gradlew bootRun --args='--spring.profiles.active=dev'

# 프론트엔드 실행 (3000 포트)
cd my-vibelist-app
npm run dev
```

### 2. 로그인 플로우 테스트

1. **리다이렉트 방식**: http://localhost:3000/login 접속 → 소셜 로그인 → 콜백 처리
2. **팝업 방식**: 팝업 창에서 로그인 → 자동 상태 갱신
3. **토큰 갱신**: 만료된 토큰 자동 갱신 확인
4. **로그아웃**: 쿠키 삭제 및 상태 초기화 확인

---

## 문제 해결

### 1. CORS 문제
```bash
# 백엔드 application.properties 확인
app.frontend.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
```

### 2. 쿠키 문제
```bash
# 개발환경에서 HTTPS 사용하지 않는 경우
app.cookie.secure=false
app.cookie.same-site=Lax
```

### 3. 환경변수 문제
```bash
# Vite에서는 VITE_ 접두사 필수
VITE_API_BASE_URL=http://localhost:8080
```

### 4. 토큰 갱신 실패
- Refresh Token 쿠키가 HttpOnly로 설정되어 있는지 확인
- apiClient에서 `withCredentials: true` 설정 확인

---

## 보안 고려사항

### 1. 운영환경 설정
- HTTPS 강제 사용
- 쿠키 Secure 플래그 활성화
- CORS 도메인 제한

### 2. 토큰 관리
- Access Token: 30분 만료
- Refresh Token: 7일 만료, HttpOnly 쿠키
- 자동 토큰 갱신 구현

### 3. 에러 처리
- API 에러 응답 적절한 처리
- 사용자 친화적 에러 메시지
- 로깅 및 모니터링

이 가이드를 따라 구현하면 React + Vite 환경에서 VibeList 백엔드의 SSO 기능을 완전히 활용할 수 있습니다.
