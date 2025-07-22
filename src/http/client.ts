import axios, { type AxiosRequestConfig } from 'axios';
import { refreshToken as refreshAuthToken } from './authApi';
import { authStorageService } from '@/services/authStorageService';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 쿠키 전송을 위해 필수!
});

// Access Token을 헤더에 추가하는 인터셉터
axiosInstance.interceptors.request.use(
  config => {
    try {
      const accessToken = authStorageService.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken.replace(/"/g, '')}`;
      }
    } catch (e) {
      console.error('세션 스토리지에서 accessToken을 가져오는 데 실패했습니다.', e);
    }
    return config;
  },
  error => Promise.reject(error)
);

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let failedQueue: ((token: string) => void)[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom(token as never);
    } else {
      prom(token as string);
    }
  });

  failedQueue = [];
};

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve) {
          failedQueue.push(token => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      
      // 이미 갱신 중인 경우 기존 Promise 반환
      if (!refreshPromise) {
        isRefreshing = true;
        refreshPromise = refreshAuthToken()
          .then(response => {
            const newAccessToken = response.data.accessToken;
            authStorageService.setAccessToken(newAccessToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return newAccessToken;
          })
          .catch(refreshError => {
            processQueue(refreshError as Error, null);
            authStorageService.clear();
            window.location.href = '/login';
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
