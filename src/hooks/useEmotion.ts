import { useMutation } from '@tanstack/react-query';
import { postEmotion } from '@/http/emotionApi';
import { EmotionPosition } from '@/types';

export const useEmotion = () => {
  return useMutation({ mutationFn: (position: EmotionPosition) => postEmotion(position) });
}; 