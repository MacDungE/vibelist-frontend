import { useMutation } from '@tanstack/react-query';
import { postMoodChange } from '@/http/moodApi';

import type {MoodChangeOption} from "@/types/common.ts";

export const useMoodChange = () => {
  return useMutation({ mutationFn: (option: MoodChangeOption) => postMoodChange(option) });
}; 