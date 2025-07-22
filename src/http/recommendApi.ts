import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { RecommendRqDto, TrackRsDto, RsDataObject } from '@/types/api';

// 감정 기반 트랙 추천
export const getRecommendations = (data: RecommendRqDto): Promise<{ data: RsDataObject<TrackRsDto[]> }> =>
  apiClient.post(API_ENDPOINTS.RECOMMEND.BASE, data);
