import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/http/authApi';
import { queryKeys } from './queryKeys';
import type { CompleteSocialSignupRequest } from '@/types/api';

// 인증 상태 확인
export const useAuthStatus = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getAuthStatus,
    select: response => response.data,
    staleTime: 0, // 30초
    retry: false, // 인증 실패 시 재시도하지 않음
  });
};

// 소셜 로그인 URL 조회
export const useSocialLoginUrls = () => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'social-login-urls'],
    queryFn: authApi.getSocialLoginUrls,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 현재 사용자 소셜 계정 조회
export const useCurrentUserSocialAccounts = () => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'social-accounts'],
    queryFn: authApi.getCurrentUserSocialAccounts,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 사용자 소셜 계정 조회 (관리자용)
export const useUserSocialAccounts = (userId: number) => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'user-social-accounts', userId],
    queryFn: () => authApi.getUserSocialAccounts(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 소셜 회원가입 완료
export const useCompleteSocialSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteSocialSignupRequest) => authApi.completeSocialSignup(data),
    onSuccess: () => {
      // 회원가입 완료 후 인증 상태 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

// 토큰 갱신
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: () => {
      // 토큰 갱신 후 인증 상태 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // 로그아웃 후 모든 쿼리 캐시 무효화
      queryClient.clear();
    },
  });
};
