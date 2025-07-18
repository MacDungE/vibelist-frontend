import { useMutation } from '@tanstack/react-query';
import * as moodApi from '@/http/moodApi';
import type { MoodChangeOption } from '@/types/common';

// 무드 변경 데이터 전송
export const usePostMoodChange = () => {
  return useMutation({
    mutationFn: (option: MoodChangeOption) => moodApi.postMoodChange(option),
  });
};
