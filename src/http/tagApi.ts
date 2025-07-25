import type { RsDataObject } from '@/types/api';
import apiClient from './client';

// API 엔드포인트
const ENDPOINTS = {
  SUGGEST: '/v1/tag/suggest',
};

/**
 * 태그 자동완성
 * @param q 검색어(초성 또는 키워드)
 * @param limit 반환 개수 (default = 10)
 */
export const suggestTags = (q: string, limit: number = 10) =>
  apiClient.get<RsDataObject<string[]>>(ENDPOINTS.SUGGEST, {
    params: { q, limit },
  });
