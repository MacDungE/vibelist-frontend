import apiClient from './client';
import type { RecommendRqDto, TrackRsDto, RsDataObject } from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/recommend',
};

// 감정 기반 트랙 추천
export const getRecommendations = (data: RecommendRqDto): Promise<{ data: RsDataObject<TrackRsDto[]> }> =>
  apiClient.post(ENDPOINTS.BASE, data);
