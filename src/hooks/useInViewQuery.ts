import { useEffect, useState } from 'react';
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

interface UseInViewQueryOptions<TData> extends UseQueryOptions<TData> {
  inView: boolean;
}

/**
 * useInViewQuery - 화면에 보일 때만 쿼리를 실행하는 커스텀 훅
 *
 * @param options - TanStack Query options with inView flag
 * @returns TanStack Query result
 */
export function useInViewQuery<TData = unknown>(
  options: UseInViewQueryOptions<TData>
): UseQueryResult<TData> {
  const { inView, enabled = true, ...queryOptions } = options;
  const [hasTriggered, setHasTriggered] = useState(false);
  const query = useQuery({
    ...queryOptions,
    enabled: false, // 수동으로 제어
  });

  useEffect(() => {
    // 화면에 보이고 아직 트리거되지 않았을 때만 실행
    if (inView && !hasTriggered && enabled) {
      query.refetch();
      setHasTriggered(true);
    }
    if (!inView && hasTriggered) {
      setHasTriggered(false);
    }
  }, [inView, hasTriggered, query, enabled]);

  return query;
}
