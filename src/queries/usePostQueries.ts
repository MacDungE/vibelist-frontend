import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postApi from '@/http/postApi';
import { queryKeys } from './queryKeys';
import type { PostCreateRequest, PostUpdateRequest } from '@/types/api';

// 게시글 상세 조회
export const usePostDetail = (postId: number) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId.toString()),
    queryFn: () => postApi.getPostDetail(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 사용자가 좋아요한 게시글 목록 조회
export const useLikedPosts = () => {
  return useQuery({
    queryKey: [...queryKeys.posts.all, 'liked'],
    queryFn: postApi.getLikedPostsByUser,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 게시글 생성
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => postApi.createPost(data),
    onSuccess: () => {
      // 게시글 생성 후 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

// 게시글 수정
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostUpdateRequest) => postApi.updatePost(data),
    onSuccess: (_, variables) => {
      // 게시글 수정 후 해당 게시글 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.id.toString()),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
};

// 게시글 삭제
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.deletePost(postId),
    onSuccess: (_, postId) => {
      // 게시글 삭제 후 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
