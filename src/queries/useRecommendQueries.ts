import { useMutation } from '@tanstack/react-query';
import * as recommendApi from '@/http/recommendApi';
import type { RecommendRqDto } from '@/types/api';

// 감정 기반 트랙 추천
export const useGetRecommendations = () => {
  return useMutation({
    mutationFn: (data: RecommendRqDto) => recommendApi.getRecommendations(data),
  });
};
