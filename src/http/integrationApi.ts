import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { IntegrationProvider, IntegrationStatus } from '@/types/api';

// 제공자별 토큰 정보 조회
export const getProviderIntegration = (provider: IntegrationProvider) =>
  apiClient.get(`${API_ENDPOINTS.INTEGRATION}/${provider}`);

// 연동 해제
export const disconnectProvider = (provider: IntegrationProvider) =>
  apiClient.delete(`${API_ENDPOINTS.INTEGRATION}/${provider}`);

// 유효한 토큰 정보 조회
export const getValidProviderIntegration = (provider: IntegrationProvider) =>
  apiClient.get(`${API_ENDPOINTS.INTEGRATION}/${provider}/valid`);

// 토큰 존재 여부 확인
export const checkProviderIntegrationExists = (
  provider: IntegrationProvider
): Promise<{ data: boolean }> => apiClient.get(`${API_ENDPOINTS.INTEGRATION}/${provider}/exists`);

// 연동 상태 조회
export const getCurrentUserIntegrationStatus = (): Promise<{ data: IntegrationStatus }> =>
  apiClient.get(`${API_ENDPOINTS.INTEGRATION}/status`);

// 연동된 제공자 목록
export const getConnectedProviders = (): Promise<{ data: string[] }> =>
  apiClient.get(`${API_ENDPOINTS.INTEGRATION}/providers`);

// 권한별 연동 조회
export const getIntegrationsByScope = (scope: string) =>
  apiClient.get(`${API_ENDPOINTS.INTEGRATION}/by-scope`, { params: { scope } });

// 모든 연동 해제
export const disconnectAllProviders = () => apiClient.delete(`${API_ENDPOINTS.INTEGRATION}/all`);
