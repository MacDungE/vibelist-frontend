import apiClient from './client';
import type {
  PostCreateRequest,
  PostUpdateRequest,
  PostDetailResponse,
  RsDataObject,
} from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/post',
  DETAIL: (id: number) => `/v1/post/${id}`,
  USER_POSTS: (username: string) => `/v1/post/${username}/posts`,
  USER_LIKES: (username: string) => `/v1/post/${username}/likes`,
  LIKES: '/v1/post/likes',
};

// 게시글 + 플레이리스트 생성
export const createPost = (data: PostCreateRequest): Promise<{ data: RsDataObject<number> }> =>
  apiClient.post(ENDPOINTS.BASE, data);

// 게시글 상세 조회
export const getPostDetail = (id: number): Promise<{ data: RsDataObject<PostDetailResponse> }> =>
  apiClient.get(ENDPOINTS.DETAIL(id));

// 게시글 삭제
export const deletePost = (id: number): Promise<{ data: RsDataObject<string> }> =>
  apiClient.delete(ENDPOINTS.DETAIL(id));

// 게시글 수정
export const updatePost = (data: PostUpdateRequest): Promise<{ data: RsDataObject<string> }> =>
  apiClient.patch(ENDPOINTS.DETAIL(data.id), data);

// 사용자가 좋아요한 게시글 목록 조회
export const getLikedPostsByUser = (): Promise<{ data: RsDataObject<PostDetailResponse[]> }> =>
  apiClient.get(ENDPOINTS.LIKES);

// 특정 사용자가 작성한 게시글 목록 조회
export const getUserPosts = (username: string, page: number = 0, size: number = 10) =>
  apiClient.get(ENDPOINTS.USER_POSTS(username), { params: { page, size } });

// 특정 사용자가 좋아요한 게시글 목록 조회
export const getUserLikedPosts = (username: string, page: number = 0, size: number = 10) =>
  apiClient.get(ENDPOINTS.USER_LIKES(username), { params: { page, size } });
