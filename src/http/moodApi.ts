import axios from 'axios';
import { MoodChangeOption } from '@/types';

export const postMoodChange = (option: MoodChangeOption) =>
  axios.post('/api/mood', { option }); 