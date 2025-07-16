import apiClient from './client';

import type { EmotionPosition } from '@/types/common.ts';

export const postEmotion = (position: EmotionPosition) => apiClient.post('/api/emotion', position);
