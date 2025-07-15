import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { CommentCreateDto, CommentUpdateDto, CommentResponseDto } from '@/types/api';

// 댓글 조회
export const getComments = (
  postId: number,
  sort: string = 'latest'
): Promise<{ data: CommentResponseDto[] }> =>
  apiClient.get(API_ENDPOINTS.COMMENT, { params: { postId, sort } });

// 댓글 생성
export const createComment = (data: CommentCreateDto) =>
  apiClient.post(API_ENDPOINTS.COMMENT, data);

// 댓글 수정
export const updateComment = (id: number, data: CommentUpdateDto) =>
  apiClient.put(`${API_ENDPOINTS.COMMENT}/${id}`, data);

// 댓글 삭제
export const deleteComment = (id: number) => apiClient.delete(`${API_ENDPOINTS.COMMENT}/${id}`);
