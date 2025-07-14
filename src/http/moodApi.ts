import axios from 'axios';
import type { MoodChangeOption } from '@/types';

export const postMoodChange = (option: MoodChangeOption) =>
  axios.post('/api/mood', { option }); 