import apiClient from './client';
import type { IntegrationProvider, IntegrationStatus } from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
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
};

// 제공자별 토큰 정보 조회
export const getProviderIntegration = (provider: IntegrationProvider) =>
  apiClient.get(ENDPOINTS.PROVIDER(provider));

// 연동 해제
export const disconnectProvider = (provider: IntegrationProvider) =>
  apiClient.delete(ENDPOINTS.PROVIDER(provider));

// 유효한 토큰 정보 조회
export const getValidProviderIntegration = (provider: IntegrationProvider) =>
  apiClient.get(ENDPOINTS.PROVIDER_VALID(provider));

// 토큰 존재 여부 확인
export const checkProviderIntegrationExists = (
  provider: IntegrationProvider
): Promise<{ data: boolean }> => apiClient.get(ENDPOINTS.PROVIDER_EXISTS(provider));

// 연동 상태 조회
export const getCurrentUserIntegrationStatus = (): Promise<{ data: IntegrationStatus }> =>
  apiClient.get(ENDPOINTS.STATUS);

// 연동된 제공자 목록
export const getConnectedProviders = (): Promise<{ data: string[] }> =>
  apiClient.get(ENDPOINTS.PROVIDERS);

// 권한별 연동 조회
export const getIntegrationsByScope = (scope: string) =>
  apiClient.get(ENDPOINTS.BY_SCOPE, { params: { scope } });

// 모든 연동 해제
export const disconnectAllProviders = () => apiClient.delete(ENDPOINTS.ALL);

// Spotify 관련 API들
export const spotifyApi = {
  // 스포티파이 토큰 디버그 정보 (개발용)
  getTokenDebugInfo: () => apiClient.get(ENDPOINTS.SPOTIFY.TOKEN_DEBUG),

  // 스포티파이 연동 시작
  connect: () => apiClient.get(ENDPOINTS.SPOTIFY.CONNECT),
};
