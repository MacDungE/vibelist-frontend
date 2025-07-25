// 소셜 로그인 URL 응답 타입
export interface SocialLoginUrls {
  google: string;
  kakao: string;
  spotify: string;
}

// 사용자 정보 타입 (기존 User 타입과 호환)
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  provider: string;
  avatar?: string;
}

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 로그인 방식 타입
export type LoginMethod = 'popup' | 'redirect';
