import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { CreateUserRequest, UpdateUserProfileRequest } from '@/types/api';

// 사용자 생성
export const createUser = (data: CreateUserRequest) =>
  apiClient.post(API_ENDPOINTS.USER.BASE, data);

// 현재 사용자 정보 조회
export const getCurrentUserInfo = () => apiClient.get(API_ENDPOINTS.USER.ME);

// 현재 사용자 삭제 (DELETE /v1/users/me)
export const deleteMe = () => apiClient.delete('/v1/users/me');

// 현재 사용자 프로필 업데이트
export const updateCurrentUserProfile = (data: UpdateUserProfileRequest) =>
  apiClient.put(API_ENDPOINTS.USER.ME_PROFILE, data);

// 사용자 검색
export const searchUsers = (name: string) =>
  apiClient.get(API_ENDPOINTS.USER.SEARCH, { params: { name } });

// 모든 사용자 목록 조회 (관리자용)
export const getAllUsers = () => apiClient.get(API_ENDPOINTS.USER.BASE);

// 특정 사용자 정보 조회 (관리자용)
export const getUserInfo = (userId: number) => apiClient.get(API_ENDPOINTS.USER.USER_INFO(userId));

// 특정 사용자 삭제 (관리자용)
export const deleteUser = (userId: number) =>
  apiClient.delete(API_ENDPOINTS.USER.USER_INFO(userId));

// 특정 사용자 프로필 업데이트 (관리자용)
export const updateUserProfile = (userId: number, data: UpdateUserProfileRequest) =>
  apiClient.put(API_ENDPOINTS.USER.PROFILE(userId), data);

// 닉네임(아이디) 중복 체크
export const checkUsername = (username: string) =>
  apiClient.get(`/v1/users/check-username`, { params: { username } });
