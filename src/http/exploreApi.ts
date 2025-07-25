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
 * 게시글 검색 (페이지네이션 지원)
 * @param query 검색 키워드
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지당 개수
 */
export const searchPosts = async (
  query: string,
  page: number = 0,
  size: number = 10
): Promise<PagePostDetailResponse> => {
  const response = await apiClient.get(API_ENDPOINTS.EXPLORE.SEARCH, {
    params: { q: query, page, size },
  });
  return response.data;
};

/**
 * 추천 피드 조회 (페이지네이션 지원)
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지당 개수
 */
export const getFeed = async (
  page: number = 0,
  size: number = 10
): Promise<PagePostDetailResponse> => {
  const response = await apiClient.get(API_ENDPOINTS.EXPLORE.FEED, {
    params: { page, size },
  });
  return response.data;
};
