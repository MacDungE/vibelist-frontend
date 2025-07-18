import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { PagePostDetailResponse, TrendResponse } from '@/types/api';

/**
 * 트렌드 조회
 * @param limit 최대 조회 개수 (기본값: 10)
 */
export const getTrends = async (limit: number = 10): Promise<TrendResponse[]> => {
  const response = await apiClient.get(API_ENDPOINTS.EXPLORE.TREND, {
    params: { limit },
  });
  return response.data;
};

/**
 * 게시글 검색
 * @param query 검색 키워드
 */
export const searchPosts = async (query: string): Promise<PagePostDetailResponse> => {
  const response = await apiClient.get(API_ENDPOINTS.EXPLORE.SEARCH, {
    params: { q: query },
  });
  return response.data;
};

/**
 * 추천 피드 조회
 */
export const getFeed = async (): Promise<PagePostDetailResponse> => {
  const response = await apiClient.get(API_ENDPOINTS.EXPLORE.FEED);
  return response.data;
};
