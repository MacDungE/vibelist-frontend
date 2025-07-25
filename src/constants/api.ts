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
