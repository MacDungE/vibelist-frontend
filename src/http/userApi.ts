import apiClient from './client';
import type { CreateUserRequest, UpdateUserProfileRequest } from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/users',
  ME: '/v1/users/me',
  ME_PROFILE: '/v1/users/me/profile',
  SEARCH: '/v1/users/search',
  PROFILE: (userId: number) => `/v1/users/${userId}/profile`,
  USER_INFO: (userId: number) => `/v1/users/${userId}`,
  CHECK_USERNAME: '/v1/users/check-username',
};

// 사용자 생성
export const createUser = (data: CreateUserRequest) =>
  apiClient.post(ENDPOINTS.BASE, data);

// 현재 사용자 정보 조회
export const getCurrentUserInfo = () => apiClient.get(ENDPOINTS.ME);

// 현재 사용자 삭제 (DELETE /v1/users/me)
export const deleteMe = () => apiClient.delete(ENDPOINTS.ME);

// 현재 사용자 프로필 업데이트
export const updateCurrentUserProfile = (data: UpdateUserProfileRequest) =>
  apiClient.put(ENDPOINTS.ME_PROFILE, data);

// 사용자 검색
export const searchUsers = (name: string) =>
  apiClient.get(ENDPOINTS.SEARCH, { params: { name } });

// 모든 사용자 목록 조회 (관리자용)
export const getAllUsers = () => apiClient.get(ENDPOINTS.BASE);

// 특정 사용자 정보 조회 (관리자용)
export const getUserInfo = (userId: number) => apiClient.get(ENDPOINTS.USER_INFO(userId));

// 특정 사용자 삭제 (관리자용)
export const deleteUser = (userId: number) =>
  apiClient.delete(ENDPOINTS.USER_INFO(userId));

// 특정 사용자 프로필 업데이트 (관리자용)
export const updateUserProfile = (userId: number, data: UpdateUserProfileRequest) =>
  apiClient.put(ENDPOINTS.PROFILE(userId), data);

// 닉네임(아이디) 중복 체크
export const checkUsername = (username: string) =>
  apiClient.get(ENDPOINTS.CHECK_USERNAME, { params: { username } });
