import apiClient from './client';

// API 엔드포인트
const ENDPOINTS = {
  HEALTH: '/health',
};

// 서버 상태 확인
export const getHealthStatus = (): Promise<{ data: Record<string, any> }> =>
  apiClient.get(ENDPOINTS.HEALTH);
