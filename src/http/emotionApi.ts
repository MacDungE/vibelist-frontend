import apiClient from './client';
import type { EmotionPosition } from '@/types/common.ts';

// API 엔드포인트
const ENDPOINTS = {
  EMOTION: '/api/emotion',
};

// NOTE: 이 엔드포인트는 API 문서에 정의되지 않았습니다. 기존 코드와의 호환성을 위해 유지합니다.
export const postEmotion = (position: EmotionPosition) =>
  apiClient.post(ENDPOINTS.EMOTION, position);
