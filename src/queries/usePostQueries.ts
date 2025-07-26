import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as postApi from '@/http/postApi';
import { queryKeys } from './queryKeys';
import type { PostCreateRequest, PostUpdateRequest } from '@/types/api';
import { useAuth } from '@/hooks/useAuth.ts';
import { useInViewQuery } from '@/hooks/useInViewQuery.ts';
import * as likeApi from '@/http/likeApi.ts';

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

// 게시글 좋아요 토글
export const usePostLike = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likeApi.togglePostLike(postId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.likeStatus(postId.toString()) });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.likeCount(postId.toString()) });
      
      // Snapshot the previous values
      const previousLikeStatus = queryClient.getQueryData(queryKeys.posts.likeStatus(postId.toString()));
      const previousLikeCount = queryClient.getQueryData(queryKeys.posts.likeCount(postId.toString()));
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.posts.likeStatus(postId.toString()), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            liked: !old.data.liked
          }
        };
      });
      
      queryClient.setQueryData(queryKeys.posts.likeCount(postId.toString()), (old: any) => {
        if (!old) return old;
        const currentLiked = previousLikeStatus?.data?.liked || false;
        return {
          ...old,
          data: {
            ...old.data,
            likeCount: currentLiked ? Math.max(0, old.data.likeCount - 1) : old.data.likeCount + 1
          }
        };
      });
      
      // Return a context object with the snapshotted values
      return { previousLikeStatus, previousLikeCount };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(queryKeys.posts.likeStatus(postId.toString()), context.previousLikeStatus);
      }
      if (context?.previousLikeCount) {
        queryClient.setQueryData(queryKeys.posts.likeCount(postId.toString()), context.previousLikeCount);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.likeStatus(postId.toString()) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.likeCount(postId.toString()) });
    },
  });
};

// 화면에 보일 때만 실행되는 게시글 좋아요 상태 조회
export const useInViewPostLikeStatus = (postId: number, inView: boolean) => {
  const { isAuthenticated, isLoading } = useAuth();

  return useInViewQuery({
    queryKey: queryKeys.posts.likeStatus(postId.toString()),
    queryFn: () => likeApi.checkPostLiked(postId),
    enabled: !!postId && isAuthenticated && !isLoading,
    inView,
    staleTime: 10 * 1000,
  });
};
// 화면에 보일 때만 실행되는 게시글 좋아요 개수 조회
export const useInViewPostLikeCount = (postId: number, inView: boolean) => {
  return useInViewQuery({
    queryKey: queryKeys.posts.likeCount(postId.toString()),
    queryFn: () => likeApi.getPostLikeCount(postId),
    enabled: !!postId,
    inView,
    staleTime: 10 * 1000,
  });
};
