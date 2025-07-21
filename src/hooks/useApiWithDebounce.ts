import { useDebounce, useAsync } from 'react-use';
import type { AxiosResponse } from 'axios';
import { useState, useCallback } from 'react';

/**
 * react-use를 활용한 디바운스된 API 호출 훅
 */
export function useApiWithDebounce<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<AxiosResponse<T>>,
  delay: number = 300
) {
  const [debouncedValue, setDebouncedValue] = useState<P | null>(null);
  
  useDebounce(
    () => {
      if (debouncedValue) {
        // API 호출 실행
      }
    },
    delay,
    [debouncedValue]
  );

  const state = useAsync(async () => {
    if (!debouncedValue) return null;
    const response = await apiFunction(...debouncedValue);
    return response.data;
  }, [debouncedValue]);

  const execute = useCallback((...args: P) => {
    setDebouncedValue(args);
  }, []);

  return {
    ...state,
    execute,
  };
}