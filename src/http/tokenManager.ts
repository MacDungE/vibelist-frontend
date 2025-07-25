import axios from 'axios';

/**
 * 토큰 갱신 전용 매니저
 * 순환 참조 방지를 위해 별도의 axios 인스턴스 사용
 */
const tokenClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 쿠키 전송을 위해 필수!
});

/**
 * Access Token 갱신
 * @returns Promise<{data: {accessToken: string}}>
 */
export const refreshAccessToken = () =>
  tokenClient.post('/v1/auth/refresh');