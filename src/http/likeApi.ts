import { API_ENDPOINTS } from '@/constants/api';
import type { LikeStatusRes, LikeCountRes, RsDataObject } from '@/types/api';
import apiClient from './client';

/**
 * 포스트 좋아요 토글
 */
export const togglePostLike = (postId: number) =>
  apiClient.post<RsDataObject>(API_ENDPOINTS.LIKE.POST(postId));

/**
 * 포스트 좋아요 상태 조회 (내가 눌렀는지)
 */
export const checkPostLiked = (postId: number) =>
  apiClient.get<LikeStatusRes>(API_ENDPOINTS.LIKE.POST_ME(postId));

/**
 * 포스트 좋아요 개수 조회
 */
export const getPostLikeCount = (postId: number) =>
  apiClient.get<LikeCountRes>(API_ENDPOINTS.LIKE.POST_COUNT(postId));

/**
 * 댓글 좋아요 토글
 */
export const toggleCommentLike = (commentId: number) =>
  apiClient.post<LikeStatusRes>(API_ENDPOINTS.LIKE.COMMENT(commentId));

/**
 * 댓글 좋아요 상태 조회 (내가 눌렀는지)
 */
export const checkCommentLiked = (commentId: number) =>
  apiClient.get<LikeStatusRes>(API_ENDPOINTS.LIKE.COMMENT_ME(commentId));

/**
 * 댓글 좋아요 개수 조회
 */
export const getCommentLikeCount = (commentId: number) =>
  apiClient.get<LikeCountRes>(API_ENDPOINTS.LIKE.COMMENT_COUNT(commentId));
