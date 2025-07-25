import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as commentApi from '@/http/commentApi';
import * as likeApi from '@/http/likeApi';
import { queryKeys } from './queryKeys';
import { SORT_OPTIONS } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

/*// CustomUserDetails 타입 정의
interface CustomUserDetails {
  enabled: boolean;
  id: number;
  password: string;
  authorities: Array<{ authority: string }>;
  username: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}*/

// 댓글 조회
export const useComments = (postId: number, sort: string = SORT_OPTIONS.LATEST) => {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId.toString()),
    queryFn: async () => {
      const res = await commentApi.getComments(postId, sort);
      return res.data.data || [];
    },
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 댓글 생성 (parentId 있으면 대댓글)
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: number; content: string; parentId?: number }) => {
      const res = await commentApi.createComment(data);
      return res.data.data;
    },
    onSuccess: (_, data) => {
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
    mutationFn: async ({ id, content }: { id: number; content: string; postId: number }) => {
      const res = await commentApi.updateComment(id, { content });
      return res.data.data;
    },
    onSuccess: (_, { postId }) => {
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
    mutationFn: async ({ id }: { id: number; postId: number }) => {
      const res = await commentApi.deleteComment(id);
      return res.data.data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(postId.toString()),
      });
    },
  });
};

// 댓글 좋아요 토글
export const useCommentLike = (commentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likeApi.toggleCommentLike(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.likeStatus(commentId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.likeCount(commentId.toString()),
      });
    },
  });
};

// 댓글 좋아요 상태(내가 눌렀는지)
export const useCommentLikeStatus = (commentId: number) => {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.comments.likeStatus(commentId.toString()),
    queryFn: () => likeApi.checkCommentLiked(commentId),
    enabled: !!commentId && isAuthenticated && !isLoading, // 로그인된 상태에서만 API 호출
    staleTime: 10 * 1000,
  });
};

// 댓글 좋아요 개수
export const useCommentLikeCount = (commentId: number) => {
  return useQuery({
    queryKey: queryKeys.comments.likeCount(commentId.toString()),
    queryFn: () => likeApi.getCommentLikeCount(commentId),
    enabled: !!commentId,
    staleTime: 10 * 1000,
  });
};
