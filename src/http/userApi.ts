import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { CreateUserRequest, UpdateUserProfileRequest } from '@/types/api';

// 사용자 생성
export const createUser = (data: CreateUserRequest) => apiClient.post(API_ENDPOINTS.USER, data);

// 현재 사용자 정보 조회
export const getCurrentUserInfo = () => apiClient.get(`${API_ENDPOINTS.USER}/me`);

// 현재 사용자 삭제
export const deleteCurrentUser = () => apiClient.delete(`${API_ENDPOINTS.USER}/me`);

// 현재 사용자 프로필 업데이트
export const updateCurrentUserProfile = (data: UpdateUserProfileRequest) =>
  apiClient.put(`${API_ENDPOINTS.USER}/me/profile`, data);

// 사용자 검색
export const searchUsers = (name: string) =>
  apiClient.get(`${API_ENDPOINTS.USER}/search`, { params: { name } });
