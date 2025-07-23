import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  PostCreateRequest,
  PostUpdateRequest,
  PostDetailResponse,
  RsDataObject,
} from '@/types/api';

// 게시글 + 플레이리스트 생성
export const createPost = (data: PostCreateRequest): Promise<{ data: RsDataObject<number> }> =>
  apiClient.post(API_ENDPOINTS.POST.BASE, data);

// 게시글 상세 조회
export const getPostDetail = (id: number): Promise<{ data: RsDataObject<PostDetailResponse> }> =>
  apiClient.get(API_ENDPOINTS.POST.DETAIL(id));

// 게시글 삭제
export const deletePost = (id: number): Promise<{ data: RsDataObject<string> }> =>
  apiClient.delete(API_ENDPOINTS.POST.DETAIL(id));

// 게시글 수정
export const updatePost = (data: PostUpdateRequest): Promise<{ data: RsDataObject<string> }> =>
  apiClient.patch(API_ENDPOINTS.POST.DETAIL(data.id), data);

// 사용자가 좋아요한 게시글 목록 조회
export const getLikedPostsByUser = (): Promise<{ data: RsDataObject<PostDetailResponse[]> }> =>
  apiClient.get(API_ENDPOINTS.POST.LIKES);
