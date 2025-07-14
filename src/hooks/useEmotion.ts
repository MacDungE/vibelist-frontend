import { useMutation } from '@tanstack/react-query';
import { postEmotion } from '@/http/emotionApi';

import type {EmotionPosition} from "@/types/common.ts";

export const useEmotion = () => {
  return useMutation({ mutationFn: (position: EmotionPosition) => postEmotion(position) });
}; 