import { useMutation } from '@tanstack/react-query';
import * as emotionApi from '@/http/emotionApi';
import type { EmotionPosition } from '@/types/common';

// 감정 데이터 전송
export const usePostEmotion = () => {
  return useMutation({
    mutationFn: (position: EmotionPosition) => emotionApi.postEmotion(position),
  });
};
