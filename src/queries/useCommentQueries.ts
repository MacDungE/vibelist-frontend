import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentApi from '@/http/commentApi';
import { queryKeys } from './queryKeys';
import { SORT_OPTIONS } from '@/constants/api';
import type { CommentCreateDto, CommentUpdateDto } from '@/types/api';

// CustomUserDetails 타입 정의
interface CustomUserDetails {
  enabled: boolean;
  id: number;
  password: string;
  authorities: Array<{ authority: string }>;
  username: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

// 댓글 조회
export const useComments = (postId: number, sort: string = SORT_OPTIONS.LATEST) => {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId.toString()),
    queryFn: () => commentApi.getComments(postId, sort),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 댓글 생성
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, details }: { data: CommentCreateDto; details: CustomUserDetails }) =>
      commentApi.createComment(data, details),
    onSuccess: (_, { data }) => {
      // 댓글 생성 후 해당 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(data.postId.toString()),
      });
    },
  });
};

// 댓글 수정
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      details,
      postId,
    }: {
      id: number;
      data: CommentUpdateDto;
      details: CustomUserDetails;
      postId: number;
    }) => commentApi.updateComment(id, data, details),
    onSuccess: (_, { postId }) => {
      // 댓글 수정 후 해당 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(postId.toString()),
      });
    },
  });
};

// 댓글 삭제
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, details }: { id: number; details: CustomUserDetails }) =>
      commentApi.deleteComment(id, details),
    onSuccess: (_, { id }) => {
      // 댓글 삭제 후 모든 게시글의 댓글 목록 무효화
      // (postId를 알 수 없으므로 모든 댓글 쿼리 무효화)
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
