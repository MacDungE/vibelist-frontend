/**
 * API 관련 글로벌 상수 정의
 */

// 환경별 API 기본 URL 설정
const getApiBaseUrl = () => {
  // 환경변수에서 명시적으로 설정된 경우
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 개발 환경에서는 프록시 사용 (CORS 문제 해결)
  if (import.meta.env.DEV) {
    return ''; // 빈 문자열로 설정하면 현재 도메인(localhost:3000) 사용
  }

  // 프로덕션 환경에서는 기본값 사용
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();

// API 타임아웃 설정 (밀리초)
export const API_TIMEOUT = 10000;

// API 버전
export const API_VERSION = 'v1';

// API 엔드포인트 경로들
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    BASE: '/v1/auth',
    SOCIAL_COMPLETE_SIGNUP: '/v1/auth/social/complete-signup',
    REFRESH: '/v1/auth/refresh',
    LOGOUT: '/v1/auth/logout',
    STATUS: '/v1/auth/status',
    SOCIAL_LOGIN_URLS: '/v1/auth/social-login-urls',
    ME_SOCIAL: '/v1/auth/me/social',
    USER_SOCIAL: (userId: number) => `/v1/auth/${userId}/social`,
  },

  // SSO 관련
  SSO: {
    BASE: '/v1/sso',
    STATUS: '/v1/sso/status',
    LOGIN_URLS: '/v1/sso/login-urls',
    HEALTH: '/v1/sso/health',
    REFRESH: '/v1/sso/refresh',
    LOGOUT: '/v1/sso/logout',
    CLAIM_TOKENS: '/v1/sso/claim-tokens',
    CALLBACK: '/v1/sso/callback',
    DEBUG_TOKENS: '/v1/sso/debug/tokens',
    CLEANUP_TOKENS: '/v1/sso/admin/cleanup-tokens',
  },

  // 사용자 관련
  USER: {
    BASE: '/v1/users',
    ME: '/v1/users/me',
    ME_PROFILE: '/v1/users/me/profile',
    SEARCH: '/v1/users/search',
    PROFILE: (userId: number) => `/v1/users/${userId}/profile`,
    USER_INFO: (userId: number) => `/v1/users/${userId}`,
  },

  // 게시글 관련
  POST: {
    BASE: '/v1/post',
    LIKES: '/v1/post/likes',
    DETAIL: (id: number) => `/v1/post/${id}`,
  },

  // 댓글 관련
  COMMENT: {
    BASE: '/v1/comments',
    DETAIL: (id: number) => `/v1/comments/${id}`,
  },

  // 추천 관련
  RECOMMEND: {
    BASE: '/v1/recommend',
  },

  // 플레이리스트 관련
  PLAYLIST: {
    BASE: '/v1/playlist',
    ADD: '/v1/playlist/add',
    LOGIN_DEV: '/v1/playlist/login-dev',
    CALLBACK: '/v1/playlist/callback',
  },

  // 외부 서비스 연동 관련
  INTEGRATION: {
    BASE: '/v1/integrations',
    STATUS: '/v1/integrations/status',
    PROVIDERS: '/v1/integrations/providers',
    BY_SCOPE: '/v1/integrations/by-scope',
    ALL: '/v1/integrations/all',
    PROVIDER: (provider: string) => `/v1/integrations/${provider}`,
    PROVIDER_VALID: (provider: string) => `/v1/integrations/${provider}/valid`,
    PROVIDER_EXISTS: (provider: string) => `/v1/integrations/${provider}/exists`,
    SPOTIFY: {
      TOKEN_DEBUG: '/v1/integrations/spotify/token-debug',
      CONNECT: '/v1/integrations/spotify/connect',
    },
  },

  // Explore 관련
  EXPLORE: {
    BASE: '/v1/explore',
    TREND: '/v1/explore/trend',
    SEARCH: '/v1/explore/search',
    FEED: '/v1/explore/feed',
  },

  // 시스템 관련
  SYSTEM: {
    HEALTH: '/health',
  },

  // 기존 API들 (API 문서에 없는 엔드포인트들)
  LEGACY: {
    EMOTION: '/api/emotion',
    MOOD: '/api/mood',
  },
} as const;

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API 응답 메시지
export const API_MESSAGES = {
  SUCCESS: '성공적으로 처리되었습니다.',
  ERROR: '오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
} as const;

// 정렬 옵션
export const SORT_OPTIONS = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  POPULAR: 'popular',
} as const;

// 추천 모드
export const RECOMMEND_MODES = {
  MAINTAIN: 'MAINTAIN',
  ELEVATE: 'ELEVATE',
  CALM_DOWN: 'CALM_DOWN',
  REVERSE: 'REVERSE',
} as const;

// 트렌드 상태
export const TREND_STATUS = {
  UP: 'UP',
  DOWN: 'DOWN',
  NEW: 'NEW',
  SAME: 'SAME',
  OUT: 'OUT',
} as const;
