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

// 게시글 검색 (페이지네이션)
export const useSearchPosts = (query: string, page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.explore.search(`${query}_${page}_${size}`),
    queryFn: () => exploreApi.searchPosts(query, page, size),
    enabled: !!query && query.length > 0,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 추천 피드 조회 (페이지네이션)
export const useFeed = (page: number, size: number) => {
  return useQuery({
    queryKey: [...queryKeys.explore.all, 'feed', page, size],
    queryFn: () => exploreApi.getFeed(page, size),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
