import apiClient from './client';

// 서버 상태 확인
export const getHealthStatus = (): Promise<{ data: Record<string, any> }> =>
  apiClient.get('/health');
