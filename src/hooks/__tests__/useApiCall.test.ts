import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiCall } from '../useApiCall';

describe('useApiCall', () => {
  const createMockApiFunction = (delay = 10) => 
    vi.fn(() => 
      new Promise<any>(resolve => 
        setTimeout(() => 
          resolve({
            data: { id: 1, name: 'test' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          }), delay
        )
      )
    ) as any;

  it('중복 요청을 방지한다', async () => {
    const mockApi = createMockApiFunction(50);
    const { result } = renderHook(() => 
      useApiCall(mockApi, { preventDuplicate: true })
    );

    // 동시에 여러 요청 실행
    act(() => {
      result.current.execute();
      result.current.execute();
      result.current.execute();
    });

    // API가 한 번만 호출되었는지 확인
    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    // 요청 완료 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 60));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ id: 1, name: 'test' });
  });

  it('preventDuplicate가 false일 때 중복 요청을 허용한다', async () => {
    const mockApi = createMockApiFunction(10);
    const { result } = renderHook(() => 
      useApiCall(mockApi, { preventDuplicate: false })
    );

    // 여러 요청 실행
    await act(async () => {
      result.current.execute();
      result.current.execute();
    });

    // API가 여러 번 호출되었는지 확인
    expect(mockApi.mock.calls.length).toBeGreaterThan(1);
  });

  it('onSuccess 콜백이 실행된다', async () => {
    const mockApi = createMockApiFunction(10);
    const onSuccess = vi.fn();
    
    const { result } = renderHook(() => 
      useApiCall(mockApi, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith({ id: 1, name: 'test' });
  });

  it('onError 콜백이 실행된다', async () => {
    const mockError = new Error('API Error');
    const failingApi = vi.fn(() => Promise.reject(mockError));
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useApiCall(failingApi, { onError })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // 에러 예상
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe(mockError);
  });

  it('cancel 함수가 진행 중인 요청을 취소한다', async () => {
    const mockApi = createMockApiFunction(100);
    const { result } = renderHook(() => useApiCall(mockApi));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.cancel();
    });

    // 약간의 지연 후 확인
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 110));
    });

    expect(result.current.loading).toBe(false);
  });
});