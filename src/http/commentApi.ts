import apiClient from './client';
import { API_ENDPOINTS, SORT_OPTIONS } from '@/constants/api';
import type {
  CommentCreateDto,
  CommentUpdateDto,
  CommentResponseDto,
  RsDataObject,
} from '@/types/api';

// 댓글 조회
export const getComments = (
  postId: number,
  sort: string = SORT_OPTIONS.LATEST
): Promise<{ data: RsDataObject<CommentResponseDto[]> }> =>
  apiClient.get(API_ENDPOINTS.COMMENT.BASE, { params: { postId, sort } });

// 댓글 생성 (엑세스 토큰은 apiClient에서 자동 헤더 처리)
export const createComment = (data: CommentCreateDto): Promise<{ data: RsDataObject<string> }> =>
  apiClient.post(API_ENDPOINTS.COMMENT.BASE, data);

// 댓글 수정
export const updateComment = (
  id: number,
  data: CommentUpdateDto
): Promise<{ data: RsDataObject<string> }> => apiClient.put(API_ENDPOINTS.COMMENT.DETAIL(id), data);

// 댓글 삭제
export const deleteComment = (id: number): Promise<{ data: RsDataObject<string> }> =>
  apiClient.delete(API_ENDPOINTS.COMMENT.DETAIL(id));
