import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { CompleteSocialSignupRequest, StatusResponse } from '@/types/api';

// 소셜 회원가입 완료
export const completeSocialSignup = (data: CompleteSocialSignupRequest) =>
  apiClient.post(`${API_ENDPOINTS.AUTH}/social/complete-signup`, data);

// 토큰 갱신
export const refreshToken = () => apiClient.post(`${API_ENDPOINTS.AUTH}/refresh`);

// 로그아웃
export const logout = () => apiClient.post(`${API_ENDPOINTS.AUTH}/logout`);

// 인증 상태 확인
export const getAuthStatus = (): Promise<{ data: StatusResponse }> =>
  apiClient.get(`${API_ENDPOINTS.AUTH}/status`);

// 소셜 로그인 URL 조회
export const getSocialLoginUrls = (): Promise<{ data: Record<string, string> }> =>
  apiClient.get(`${API_ENDPOINTS.AUTH}/social-login-urls`);

// 현재 사용자 소셜 계정 조회
export const getCurrentUserSocialAccounts = () => apiClient.get(`${API_ENDPOINTS.AUTH}/me/social`);
