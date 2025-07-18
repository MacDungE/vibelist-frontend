import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/http/authApi';
import { queryKeys } from './queryKeys';
import type { CompleteSocialSignupRequest } from '@/types/api';

// 인증 상태 확인
export const useAuthStatus = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getAuthStatus,
    staleTime: 30 * 1000, // 30초
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

// SSO 관련 훅들
export const useSSOStatus = () => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'sso-status'],
    queryFn: authApi.ssoApi.getStatus,
    staleTime: 30 * 1000, // 30초
  });
};

export const useSSOLoginUrls = (redirectUrl?: string) => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'sso-login-urls', redirectUrl],
    queryFn: () => authApi.ssoApi.getLoginUrls(redirectUrl),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useSSOHealth = () => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'sso-health'],
    queryFn: authApi.ssoApi.health,
    staleTime: 30 * 1000, // 30초
  });
};

export const useSSORefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.ssoApi.refreshToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

export const useSSOLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.ssoApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useSSOClaimTokens = () => {
  return useMutation({
    mutationFn: (data: Record<string, string>) => authApi.ssoApi.claimTokens(data),
  });
};

export const useSSOClaimTokensGet = (tokenId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'sso-claim-tokens', tokenId],
    queryFn: () => authApi.ssoApi.claimTokensGet(tokenId),
    enabled: !!tokenId,
    staleTime: 30 * 1000, // 30초
  });
};

export const useSSOCallback = () => {
  return useMutation({
    mutationFn: (params: { status?: string; provider?: string; error?: string }) =>
      authApi.ssoApi.handleCallback(params),
  });
};

// 개발환경 전용 훅들
export const useSSODebugTokens = () => {
  return useQuery({
    queryKey: [...queryKeys.auth.all, 'sso-debug-tokens'],
    queryFn: authApi.ssoApi.debugTokens,
    enabled: process.env.NODE_ENV === 'development',
    staleTime: 30 * 1000, // 30초
  });
};

export const useSSOCleanupTokens = () => {
  return useMutation({
    mutationFn: authApi.ssoApi.cleanupAllTokens,
  });
};
