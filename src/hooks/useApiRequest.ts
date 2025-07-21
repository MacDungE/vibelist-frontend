import { useState, useCallback, useRef, useEffect } from 'react';
import type { AxiosResponse, AxiosError } from 'axios';

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  immediate?: boolean;
  cacheTime?: number;
}

interface UseApiRequestReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  execute: (...args: P) => Promise<T | undefined>;
  reset: () => void;
}

export function useApiRequest<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<AxiosResponse<T>>,
  options: UseApiRequestOptions<T> = {}
): UseApiRequestReturn<T, P> {
  const { onSuccess, onError, cacheTime = 0 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      // 캐시 확인
      if (cacheTime > 0 && cacheRef.current) {
        const isExpired = Date.now() - cacheRef.current.timestamp > cacheTime;
        if (!isExpired) {
          setData(cacheRef.current.data);
          return cacheRef.current.data;
        }
      }

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);
        const responseData = response.data;
        
        setData(responseData);
        
        // 캐시 저장
        if (cacheTime > 0) {
          cacheRef.current = {
            data: responseData,
            timestamp: Date.now(),
          };
        }
        
        onSuccess?.(responseData);
        return responseData;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        
        const axiosError = err as AxiosError;
        setError(axiosError);
        onError?.(axiosError);
        throw axiosError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, cacheTime]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    cacheRef.current = null;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}