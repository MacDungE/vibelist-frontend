import axios from 'axios';
import { EmotionPosition } from '@/types';

export const postEmotion = (position: EmotionPosition) =>
  axios.post('/api/emotion', position); 