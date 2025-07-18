import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/http/userApi';
import { queryKeys } from './queryKeys';
import type { CreateUserRequest, UpdateUserProfileRequest } from '@/types/api';

// 현재 사용자 정보 조회
export const useCurrentUserInfo = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: userApi.getCurrentUserInfo,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 사용자 검색
export const useSearchUsers = (name: string) => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'search', name],
    queryFn: () => userApi.searchUsers(name),
    enabled: !!name && name.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 모든 사용자 목록 조회 (관리자용)
export const useAllUsers = () => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'all'],
    queryFn: userApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 특정 사용자 정보 조회 (관리자용)
export const useUserInfo = (userId: number) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId.toString()),
    queryFn: () => userApi.getUserInfo(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 사용자 생성
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: () => {
      // 사용자 생성 후 사용자 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

// 현재 사용자 프로필 업데이트
export const useUpdateCurrentUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.updateCurrentUserProfile(data),
    onSuccess: () => {
      // 프로필 업데이트 후 현재 사용자 정보 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

// 특정 사용자 프로필 업데이트 (관리자용)
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateUserProfileRequest }) =>
      userApi.updateUserProfile(userId, data),
    onSuccess: (_, { userId }) => {
      // 프로필 업데이트 후 해당 사용자 정보 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(userId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

// 현재 사용자 삭제
export const useDeleteCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteCurrentUser,
    onSuccess: () => {
      // 사용자 삭제 후 모든 쿼리 캐시 무효화
      queryClient.clear();
    },
  });
};

// 특정 사용자 삭제 (관리자용)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      // 사용자 삭제 후 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(userId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};
