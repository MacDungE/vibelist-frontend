import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';

// 서버 상태 확인
export const getHealthStatus = (): Promise<{ data: Record<string, any> }> =>
  apiClient.get(API_ENDPOINTS.SYSTEM.HEALTH);
