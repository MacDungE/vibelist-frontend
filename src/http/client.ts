import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '@/constants/api';

// 토큰 재발급 중인지 확인하는 플래그
let isRefreshing = false;
// 토큰 재발급 대기 중인 요청들을 저장하는 큐
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 인증을 위해 필요
});

// 요청 인터셉터 (필요시 토큰 추가 등)
apiClient.interceptors.request.use(
  config => {
    // 로컬 스토리지에서 토큰 가져오기 (필요시)
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 토큰 API 호출 자체가 401이면 바로 리다이렉트
      if (originalRequest.url?.includes(`${API_ENDPOINTS.AUTH}/refresh`)) {
        // 토큰 재발급 실패 - 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 이미 토큰 재발급 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 토큰 재발급 완료 후 원래 요청 재시도
            originalRequest._retry = true;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refresh 토큰으로 새 access 토큰 발급
        await apiClient.post(`${API_ENDPOINTS.AUTH}/refresh`);

        // 토큰 재발급 성공
        processQueue(null);
        isRefreshing = false;

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 재발급 실패
        processQueue(refreshError);
        isRefreshing = false;

        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
