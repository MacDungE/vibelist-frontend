import { useQuery } from '@tanstack/react-query';
import * as systemApi from '@/http/systemApi';
import { queryKeys } from './queryKeys';

// 서버 상태 확인
export const useHealthStatus = () => {
  return useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: systemApi.getHealthStatus,
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
};
