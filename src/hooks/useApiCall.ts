import { useCallback, useRef, useState } from 'react';
import type { AxiosResponse } from 'axios';

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  preventDuplicate?: boolean;
}

export const useApiCall = <T = any>(
  apiFunction: (...args: any[]) => Promise<AxiosResponse<T>>,
  options: UseApiCallOptions = {}
) => {
  const { onSuccess, onError, preventDuplicate = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestInProgressRef = useRef(false);

  const execute = useCallback(
    async (...args: any[]) => {
      // 중복 요청 방지
      if (preventDuplicate && isRequestInProgressRef.current) {
        console.warn('API request already in progress, skipping duplicate request');
        return;
      }

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      isRequestInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args, {
          signal: abortControllerRef.current.signal,
        });
        setData(response.data);
        onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request was cancelled');
          return;
        }
        setError(err);
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
        isRequestInProgressRef.current = false;
      }
    },
    [apiFunction, onSuccess, onError, preventDuplicate]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      isRequestInProgressRef.current = false;
    }
  }, []);

  return { execute, loading, error, data, cancel };
};