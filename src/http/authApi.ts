import apiClient from './client';
import { refreshAccessToken } from './tokenManager';
import type {
  StatusResponse,
  CompleteSocialSignupRequest,
  LoginRequest,
} from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/auth',
  LOGIN: '/v1/auth/login',
  SOCIAL_COMPLETE_SIGNUP: '/v1/auth/social/complete-signup',
  REFRESH: '/v1/auth/refresh',
  LOGOUT: '/v1/auth/logout',
  STATUS: '/v1/auth/status',
  SOCIAL_LOGIN_URLS: '/v1/auth/social-login-urls',
  ME_SOCIAL: '/v1/auth/me/social',
  USER_SOCIAL: (userId: number) => `/v1/auth/${userId}/social`,
};

// 로그인 (username/password)
export const login = (data: LoginRequest) =>
  apiClient.post(ENDPOINTS.LOGIN, data);

// 소셜 회원가입 완료
export const completeSocialSignup = (data: CompleteSocialSignupRequest) =>
  apiClient.post(ENDPOINTS.SOCIAL_COMPLETE_SIGNUP, data);

// 토큰 갱신 (tokenManager 사용)
export const refreshToken = refreshAccessToken;

// 로그아웃
export const logout = () => apiClient.post(ENDPOINTS.LOGOUT);

// 인증 상태 확인
export const getAuthStatus = () => apiClient.get<StatusResponse>(ENDPOINTS.STATUS);

// 소셜 로그인 URL 조회
export const getSocialLoginUrls = (): Promise<{ data: Record<string, string> }> =>
  apiClient.get(ENDPOINTS.SOCIAL_LOGIN_URLS);

// 현재 사용자 소셜 계정 조회
export const getCurrentUserSocialAccounts = () => apiClient.get(ENDPOINTS.ME_SOCIAL);

// 사용자 소셜 계정 조회 (관리자용)
export const getUserSocialAccounts = (userId: number) =>
  apiClient.get(ENDPOINTS.USER_SOCIAL(userId));

