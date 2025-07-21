import { useQuery } from '@tanstack/react-query';
import * as exploreApi from '@/http/exploreApi';
import { queryKeys } from './queryKeys';

// 트렌드 조회
export const useTrends = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.explore.trending(),
    queryFn: () => exploreApi.getTrends(limit),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 게시글 검색
export const useSearchPosts = (query: string) => {
  return useQuery({
    queryKey: queryKeys.explore.search(query),
    queryFn: () => exploreApi.searchPosts(query),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 추천 피드 조회
export const useFeed = () => {
  return useQuery({
    queryKey: [...queryKeys.explore.all, 'feed'],
    queryFn: exploreApi.getFeed,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
