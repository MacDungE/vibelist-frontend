import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '@/constants/api';

// axios 전역 설정
axios.defaults.withCredentials = true;

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
  withCredentials: true, // HttpOnly 쿠키 사용을 위해 필수
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  config => {
    console.log('🚀 API 요청:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('❌ API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (토큰 만료 처리)
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API 응답:', response.status, response.config.url);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 토큰 API 호출 자체가 401이면 바로 리다이렉트
      // 또는 status 확인 API는 인증되지 않은 상태에서도 정상적으로 호출 가능
      if (
        originalRequest.url?.includes('/v1/sso/refresh') ||
        originalRequest.url?.includes('/v1/sso/status')
      ) {
        // 토큰 재발급 실패 또는 status 확인 - 바로 에러 반환
        if (originalRequest.url?.includes('/v1/sso/status')) {
          return Promise.reject(error);
        }
        // refresh 실패는 로그인 페이지로 리다이렉트
        console.error('토큰 갱신 실패:', error);
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
        // SSO refresh 토큰으로 새 access 토큰 발급
        await apiClient.post('/v1/sso/refresh');

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
        console.error('토큰 갱신 실패:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('❌ API 응답 에러:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;
