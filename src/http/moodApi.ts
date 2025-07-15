import apiClient from './client';

import type { MoodChangeOption } from '@/types/common.ts';

export const postMoodChange = (option: MoodChangeOption) => apiClient.post('/api/mood', { option });
