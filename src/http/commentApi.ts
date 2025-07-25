import apiClient from './client';
import { SORT_OPTIONS } from '@/constants/api';
import type {
  CommentCreateDto,
  CommentUpdateDto,
  CommentResponseDto,
  RsDataObject,
} from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/comments',
  DETAIL: (id: number) => `/v1/comments/${id}`,
};

// 댓글 조회
export const getComments = (
  postId: number,
  sort: string = SORT_OPTIONS.LATEST
): Promise<{ data: RsDataObject<CommentResponseDto[]> }> =>
  apiClient.get(ENDPOINTS.BASE, { params: { postId, sort } });

// 댓글 생성 (엑세스 토큰은 apiClient에서 자동 헤더 처리)
export const createComment = (data: CommentCreateDto): Promise<{ data: RsDataObject<string> }> =>
  apiClient.post(ENDPOINTS.BASE, data);

// 댓글 수정
export const updateComment = (
  id: number,
  data: CommentUpdateDto
): Promise<{ data: RsDataObject<string> }> => apiClient.put(ENDPOINTS.DETAIL(id), data);

// 댓글 삭제
export const deleteComment = (id: number): Promise<{ data: RsDataObject<string> }> =>
  apiClient.delete(ENDPOINTS.DETAIL(id));
