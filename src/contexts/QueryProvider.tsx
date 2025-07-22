import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 stale time을 5분으로 설정 (5분 동안은 캐시된 데이터 사용)
      staleTime: 5 * 60 * 1000,
      // 기본 cache time을 10분으로 설정
      gcTime: 10 * 60 * 1000,
      // 에러 발생 시 재시도 횟수
      retry: 1,
      // 백그라운드에서 refetch 비활성화
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query Devtools 표시 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export { queryClient };
