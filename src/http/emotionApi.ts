import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { EmotionPosition } from '@/types/common.ts';

// NOTE: 이 엔드포인트는 API 문서에 정의되지 않았습니다. 기존 코드와의 호환성을 위해 유지합니다.
export const postEmotion = (position: EmotionPosition) =>
  apiClient.post(API_ENDPOINTS.LEGACY.EMOTION, position);
