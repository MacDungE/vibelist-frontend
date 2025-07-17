import apiClient from '@/http/client';
import type { SSOStatusResponse, SocialLoginUrls, SSOProvider, LoginMethod } from '@/types/auth';
import { API_BASE_URL } from '@/constants/api';

class SSOService {
  /**
   * 소셜 로그인 URL 목록 조회
   */
  async getLoginUrls(redirectUrl?: string): Promise<SocialLoginUrls> {
    const params = redirectUrl ? { redirectUrl } : {};
    const response = await apiClient.get('/v1/sso/login-urls', { params });
    return response.data;
  }

  /**
   * 인증 상태 확인
   */
  async getStatus(): Promise<SSOStatusResponse> {
    const response = await apiClient.get('/v1/sso/status');
    return response.data;
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<{ status: string; message: string }> {
    const response = await apiClient.post('/v1/sso/refresh');
    return response.data;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<{ status: string; message: string }> {
    const response = await apiClient.post('/v1/sso/logout');
    return response.data;
  }

  /**
   * 소셜 로그인 시작 (팝업 방식)
   */
  async startSocialLogin(provider: SSOProvider): Promise<void> {
    const urls = await this.getLoginUrls();
    const loginUrl = `${API_BASE_URL}${urls[provider]}`;

    // 팝업 창으로 소셜 로그인 시작
    const popup = window.open(
      loginUrl,
      'social-login',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // 팝업 모니터링
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // 팝업이 닫히면 인증 상태 확인
          this.getStatus()
            .then(status => {
              if (status.authenticated) {
                resolve();
              } else {
                reject(new Error('로그인이 취소되었습니다.'));
              }
            })
            .catch(reject);
        }
      }, 1000);

      // 10분 후 타임아웃
      setTimeout(() => {
        clearInterval(checkClosed);
        popup?.close();
        reject(new Error('로그인 시간이 초과되었습니다.'));
      }, 600000);
    });
  }

  /**
   * 리다이렉트 방식 소셜 로그인
   */
  async redirectToSocialLogin(provider: SSOProvider): Promise<void> {
    const urls = await this.getLoginUrls(window.location.origin + '/auth/callback');
    const loginUrl = `${API_BASE_URL}${urls[provider]}`;
    window.location.href = loginUrl;
  }
}

export const ssoService = new SSOService();
export default SSOService;
