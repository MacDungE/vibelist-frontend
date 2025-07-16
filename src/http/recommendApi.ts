import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { RecommendRqDto, TrackRsDto } from '@/types/api';

// 감정 기반 트랙 추천
export const getRecommendations = (data: RecommendRqDto): Promise<{ data: TrackRsDto }> =>
  apiClient.post(API_ENDPOINTS.RECOMMEND, data);
