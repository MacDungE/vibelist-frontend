import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiRequest } from '../useApiRequest';

describe('useApiRequest', () => {
  const mockApiFunction = vi.fn(() =>
    Promise.resolve({
      data: { message: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    })
  ) as any;

  it('API 호출을 성공적으로 처리한다', async () => {
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.execute();
    });

    expect(mockApiFunction).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ message: 'success' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('API 호출 실패를 처리한다', async () => {
    const mockError = new Error('API Error');
    const failingApiFunction = vi.fn(() => Promise.reject(mockError));

    const { result } = renderHook(() => useApiRequest(failingApiFunction));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // 에러가 throw되는 것을 예상
      }
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('캐싱이 올바르게 동작한다', async () => {
    const mockCacheApi = vi.fn(() =>
      Promise.resolve({
        data: { message: 'cached' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      })
    ) as any;

    const { result } = renderHook(() => 
      useApiRequest(mockCacheApi, { cacheTime: 1000 })
    );

    // 첫 번째 호출
    await act(async () => {
      await result.current.execute();
    });
    expect(mockCacheApi).toHaveBeenCalledTimes(1);

    // 두 번째 호출 (캐시 사용)
    await act(async () => {
      await result.current.execute();
    });
    expect(mockCacheApi).toHaveBeenCalledTimes(1); // 여전히 1번만 호출

    // 캐시 시간 후 호출
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    await act(async () => {
      await result.current.execute();
    });
    expect(mockCacheApi).toHaveBeenCalledTimes(2);
  });

  it('reset 함수가 올바르게 동작한다', async () => {
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ message: 'success' });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('컴포넌트 언마운트 시 진행 중인 요청을 취소한다', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { result, unmount } = renderHook(() => useApiRequest(mockApiFunction));

    act(() => {
      result.current.execute();
    });

    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});