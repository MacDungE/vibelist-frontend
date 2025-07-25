import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as integrationApi from '@/http/integrationApi';
import { queryKeys } from './queryKeys';
import type { IntegrationProvider } from '@/types/api';

// 제공자별 토큰 정보 조회
export const useProviderIntegration = (provider: IntegrationProvider) => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'integration', provider],
    queryFn: () => integrationApi.getProviderIntegration(provider),
    enabled: !!provider,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 유효한 토큰 정보 조회
export const useValidProviderIntegration = (provider: IntegrationProvider) => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'integration-valid', provider],
    queryFn: () => integrationApi.getValidProviderIntegration(provider),
    enabled: !!provider,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 토큰 존재 여부 확인
export const useProviderIntegrationExists = (provider: IntegrationProvider) => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'integration-exists', provider],
    queryFn: () => integrationApi.checkProviderIntegrationExists(provider),
    enabled: !!provider,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 연동 상태 조회
export const useCurrentUserIntegrationStatus = () => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'integration-status'],
    queryFn: integrationApi.getCurrentUserIntegrationStatus,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 연동된 제공자 목록
export const useConnectedProviders = () => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'connected-providers'],
    queryFn: integrationApi.getConnectedProviders,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 권한별 연동 조회
export const useIntegrationsByScope = (scope: string) => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'integrations-by-scope', scope],
    queryFn: () => integrationApi.getIntegrationsByScope(scope),
    enabled: !!scope,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 연동 해제
export const useDisconnectProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: IntegrationProvider) => integrationApi.disconnectProvider(provider),
    onSuccess: () => {
      // 연동 해제 후 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

// 모든 연동 해제
export const useDisconnectAllProviders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.disconnectAllProviders,
    onSuccess: () => {
      // 모든 연동 해제 후 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

// Spotify 관련 훅들
export const useSpotifyTokenDebugInfo = () => {
  return useQuery({
    queryKey: [...queryKeys.user.all, 'spotify-token-debug'],
    queryFn: integrationApi.spotifyApi.getTokenDebugInfo,
    enabled: process.env.NODE_ENV === 'development',
    staleTime: 30 * 1000, // 30초
  });
};

export const useSpotifyConnect = () => {
  return useMutation({
    mutationFn: integrationApi.spotifyApi.connect,
  });
};
