import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestManager } from '../requestManager';
import type { AxiosResponse } from 'axios';

describe('requestManager', () => {
  beforeEach(() => {
    requestManager.clearCache();
  });

  const createMockRequest = (data: any, delay = 10): () => Promise<AxiosResponse> =>
    () => new Promise(resolve => 
      setTimeout(() => 
        resolve({
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }), delay
      )
    );

  it('동일한 키로 동시 요청 시 하나의 요청만 실행된다', async () => {
    const mockFn = vi.fn(createMockRequest({ message: 'test' }));
    const key = 'test-key';

    // 동시에 3개의 요청 실행
    const promises = [
      requestManager.execute(key, mockFn),
      requestManager.execute(key, mockFn),
      requestManager.execute(key, mockFn),
    ];

    const results = await Promise.all(promises);

    // 함수는 한 번만 호출됨
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    // 모든 결과가 동일함
    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
    expect(results[0].data).toEqual({ message: 'test' });
  });

  it('다른 키로 요청 시 각각 실행된다', async () => {
    const mockFn1 = vi.fn(createMockRequest({ id: 1 }));
    const mockFn2 = vi.fn(createMockRequest({ id: 2 }));

    const [result1, result2] = await Promise.all([
      requestManager.execute('key1', mockFn1),
      requestManager.execute('key2', mockFn2),
    ]);

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
    expect(result1.data).toEqual({ id: 1 });
    expect(result2.data).toEqual({ id: 2 });
  });

  it('캐시 기간이 지나면 새로운 요청을 실행한다', async () => {
    const mockFn = vi.fn(createMockRequest({ count: 1 }));
    const key = 'cache-test';
    const cacheDuration = 50;

    // 첫 번째 요청
    await requestManager.execute(key, mockFn, cacheDuration);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 캐시 기간 내 재요청 (캐시 사용)
    await requestManager.execute(key, mockFn, cacheDuration);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 캐시 기간 후 재요청
    await new Promise(resolve => setTimeout(resolve, cacheDuration + 10));
    await requestManager.execute(key, mockFn, cacheDuration);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('요청 실패 시 캐시에서 즉시 제거된다', async () => {
    const error = new Error('Request failed');
    const failingFn = vi.fn(() => Promise.reject(error));
    const successFn = vi.fn(createMockRequest({ success: true }));
    const key = 'error-test';

    // 실패하는 요청
    try {
      await requestManager.execute(key, failingFn);
    } catch (e) {
      expect(e).toBe(error);
    }

    // 같은 키로 즉시 재요청 (새로운 요청 실행됨)
    const result = await requestManager.execute(key, successFn);
    
    expect(failingFn).toHaveBeenCalledTimes(1);
    expect(successFn).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({ success: true });
  });

  it('clearCache가 특정 키의 캐시를 제거한다', async () => {
    const mockFn = vi.fn(createMockRequest({ data: 'test' }));
    const key = 'clear-test';

    await requestManager.execute(key, mockFn);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 캐시 제거
    requestManager.clearCache(key);

    // 재요청 시 새로운 요청 실행
    await requestManager.execute(key, mockFn);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('clearCache가 모든 캐시를 제거한다', async () => {
    const mockFn1 = vi.fn(createMockRequest({ id: 1 }));
    const mockFn2 = vi.fn(createMockRequest({ id: 2 }));

    await Promise.all([
      requestManager.execute('key1', mockFn1),
      requestManager.execute('key2', mockFn2),
    ]);

    // 전체 캐시 제거
    requestManager.clearCache();

    // 재요청 시 모두 새로운 요청 실행
    await Promise.all([
      requestManager.execute('key1', mockFn1),
      requestManager.execute('key2', mockFn2),
    ]);

    expect(mockFn1).toHaveBeenCalledTimes(2);
    expect(mockFn2).toHaveBeenCalledTimes(2);
  });
});