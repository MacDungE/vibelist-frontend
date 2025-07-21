import apiClient from './client';
import { API_ENDPOINTS, SORT_OPTIONS } from '@/constants/api';
import type { CommentCreateDto, CommentUpdateDto, CommentResponseDto } from '@/types/api';

// CustomUserDetails 타입 정의 (API 문서에서 참조)
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
export const getComments = (
  postId: number,
  sort: string = SORT_OPTIONS.LATEST
): Promise<{ data: CommentResponseDto[] }> =>
  apiClient.get(API_ENDPOINTS.COMMENT.BASE, { params: { postId, sort } });

// 댓글 생성
export const createComment = (data: CommentCreateDto, details: CustomUserDetails) =>
  apiClient.post(API_ENDPOINTS.COMMENT.BASE, data, { params: { details } });

// 댓글 수정
export const updateComment = (id: number, data: CommentUpdateDto, details: CustomUserDetails) =>
  apiClient.put(API_ENDPOINTS.COMMENT.DETAIL(id), data, { params: { details } });

// 댓글 삭제
export const deleteComment = (id: number, details: CustomUserDetails) =>
  apiClient.delete(API_ENDPOINTS.COMMENT.DETAIL(id), { params: { details } });
