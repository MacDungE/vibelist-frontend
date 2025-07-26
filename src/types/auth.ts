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

// 소셜 계정 정보 타입
export interface SocialAccount {
  id: number;
  provider: string;
  providerId: string;
  email?: string;
  displayName?: string;
  profileUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 소셜 계정 응답 DTO 타입
export interface SocialAccount {
  /** 소셜 계정 연동 정보의 고유 ID */
  id: number;

  /** 소셜 로그인 제공자 (GOOGLE, KAKAO, NAVER 등) */
  provider: string;

  /** 소셜 제공자에서 발급한 사용자 ID */
  providerUserId: string;

  /** 소셜 제공자에서 제공하는 이메일 주소 */
  providerEmail: string;

  /** 소셜 계정 연동 시간 */
  createdAt: string;
}

// 소셜 계정 목록 응답 타입
export interface SocialAccountsResponse {
  data: SocialAccount[];
}
