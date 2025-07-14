import { useMutation } from '@tanstack/react-query';
import { postMoodChange } from '@/http/moodApi';
import type { MoodChangeOption } from '@/types';

export const useMoodChange = () => {
  return useMutation({ mutationFn: (option: MoodChangeOption) => postMoodChange(option) });
}; 