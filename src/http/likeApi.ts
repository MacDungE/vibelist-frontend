import type { LikeStatusRes, LikeCountRes, RsDataObject } from '@/types/api';
import apiClient from './client';

// API 엔드포인트
const ENDPOINTS = {
  POST: (postId: number) => `/v1/post/${postId}/likes`,
  POST_ME: (postId: number) => `/v1/post/${postId}/likes/me`,
  POST_COUNT: (postId: number) => `/v1/post/${postId}/likes/count`,
  COMMENT: (commentId: number) => `/v1/comment/${commentId}/likes`,
  COMMENT_ME: (commentId: number) => `/v1/comment/${commentId}/likes/me`,
  COMMENT_COUNT: (commentId: number) => `/v1/comment/${commentId}/likes/count`,
};

/**
 * 포스트 좋아요 토글
 */
export const togglePostLike = (postId: number) =>
  apiClient.post<RsDataObject>(ENDPOINTS.POST(postId));

/**
 * 포스트 좋아요 상태 조회 (내가 눌렀는지)
 */
export const checkPostLiked = (postId: number) =>
  apiClient.get<LikeStatusRes>(ENDPOINTS.POST_ME(postId));

/**
 * 포스트 좋아요 개수 조회
 */
export const getPostLikeCount = (postId: number) =>
  apiClient.get<LikeCountRes>(ENDPOINTS.POST_COUNT(postId));

/**
 * 댓글 좋아요 토글
 */
export const toggleCommentLike = (commentId: number) =>
  apiClient.post<LikeStatusRes>(ENDPOINTS.COMMENT(commentId));

/**
 * 댓글 좋아요 상태 조회 (내가 눌렀는지)
 */
export const checkCommentLiked = (commentId: number) =>
  apiClient.get<LikeStatusRes>(ENDPOINTS.COMMENT_ME(commentId));

/**
 * 댓글 좋아요 개수 조회
 */
export const getCommentLikeCount = (commentId: number) =>
  apiClient.get<LikeCountRes>(ENDPOINTS.COMMENT_COUNT(commentId));
