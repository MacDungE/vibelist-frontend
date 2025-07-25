import apiClient from './client';
import { refreshAccessToken } from './tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  StatusResponse,
  CompleteSocialSignupRequest,
  SocialLoginCallbackResponse,
  LoginRequest,
} from '@/types/api';

// 로그인 (username/password)
export const login = (data: LoginRequest) =>
  apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);

// OAuth2 토큰 획득 (리프레시 토큰 사용)
export const getOAuth2AccessToken = () =>
  apiClient.post(API_ENDPOINTS.AUTH.OAUTH2_TOKEN);

// 소셜 로그인 콜백
export const socialLoginCallback = (token: string) => {
  return apiClient
    .get<SocialLoginCallbackResponse>(API_ENDPOINTS.AUTH.SOCIAL_CALLBACK, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      console.log('Social Login Callback Response:', response);
      return response;
    });
};

// 소셜 회원가입 완료
export const completeSocialSignup = (data: CompleteSocialSignupRequest) =>
  apiClient.post(API_ENDPOINTS.AUTH.SOCIAL_COMPLETE_SIGNUP, data);

// 토큰 갱신 (tokenManager 사용)
export const refreshToken = refreshAccessToken;

// 로그아웃
export const logout = () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

// 인증 상태 확인
export const getAuthStatus = () => apiClient.get<StatusResponse>(API_ENDPOINTS.AUTH.STATUS);

// 소셜 로그인 URL 조회
export const getSocialLoginUrls = (): Promise<{ data: Record<string, string> }> =>
  apiClient.get(API_ENDPOINTS.AUTH.SOCIAL_LOGIN_URLS);

// 현재 사용자 소셜 계정 조회
export const getCurrentUserSocialAccounts = () => apiClient.get(API_ENDPOINTS.AUTH.ME_SOCIAL);

// 사용자 소셜 계정 조회 (관리자용)
export const getUserSocialAccounts = (userId: number) =>
  apiClient.get(API_ENDPOINTS.AUTH.USER_SOCIAL(userId));

