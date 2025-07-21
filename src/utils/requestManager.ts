import type { AxiosResponse } from 'axios';

interface PendingRequest {
  promise: Promise<AxiosResponse>;
  timestamp: number;
}

class RequestManager {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly CACHE_DURATION = 5000; // 5초


  async execute<T>(
    key: string,
    requestFn: () => Promise<AxiosResponse<T>>,
    cacheDuration: number = this.CACHE_DURATION
  ): Promise<AxiosResponse<T>> {
    const now = Date.now();
    const pending = this.pendingRequests.get(key);

    // 진행 중인 요청이 있고 캐시가 유효한 경우
    if (pending && now - pending.timestamp < cacheDuration) {
      console.log(`Returning cached/pending request for key: ${key}`);
      return pending.promise as Promise<AxiosResponse<T>>;
    }

    // 새로운 요청 실행
    const promise = requestFn()
      .then(response => {
        // 성공 시 일정 시간 후 캐시에서 제거
        setTimeout(() => {
          this.pendingRequests.delete(key);
        }, cacheDuration);
        return response;
      })
      .catch(error => {
        // 실패 시 즉시 캐시에서 제거
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, { promise, timestamp: now });
    return promise as Promise<AxiosResponse<T>>;
  }

  clearCache(key?: string): void {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}

export const requestManager = new RequestManager();