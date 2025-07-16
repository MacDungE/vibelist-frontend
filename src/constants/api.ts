/**
 * API 관련 글로벌 상수 정의
 */

// 환경변수에서 API 기본 URL 가져오기
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API 타임아웃 설정 (밀리초)
export const API_TIMEOUT = 10000;

// API 버전
export const API_VERSION = 'v1';

// API 엔드포인트 경로들
export const API_ENDPOINTS = {
  AUTH: '/v1/auth',
  USER: '/v1/users',
  POST: '/v1/post',
  COMMENT: '/v1/comments',
  EMOTION: '/v1/emotion',
  MOOD: '/v1/mood',
  PLAYLIST: '/v1/playlist',
  RECOMMEND: '/v1/recommend',
  INTEGRATION: '/v1/integrations',
  SYSTEM: '/v1/system',
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
