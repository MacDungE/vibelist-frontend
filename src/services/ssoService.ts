import apiClient from '@/http/client';
import type { SocialLoginUrls, SSOProvider, SSOStatusResponse } from '@/types/auth';
import { API_BASE_URL } from '@/constants/api';

class SSOService {
  // 🔧 중복 호출 방지를 위한 플래그
  private isClaimingTokens = false;

  /**
   * 소셜 로그인 URL 목록 조회
   */
  async getLoginUrls(redirectUrl?: string): Promise<SocialLoginUrls> {
    const params = redirectUrl ? { redirectUrl } : {};
    const response = await apiClient.get('/v1/sso/login-urls', { params });
    return response.data;
  }

  /**
   * 임시 토큰으로 실제 JWT 토큰 클레임 (보안 강화 v2)
   */
  async claimTokens(tokenId: string): Promise<{
    status: string;
    message: string;
    provider?: string;
    isNewUser?: boolean;
    tempUserId?: string;
  }> {
    // 🔧 중복 호출 방지
    if (this.isClaimingTokens) {
      console.log('이미 토큰 클레임 중입니다. 중복 호출을 방지합니다.');
      throw new Error('토큰 클레임이 이미 진행 중입니다.');
    }

    this.isClaimingTokens = true;

    try {
      const response = await apiClient.post('/v1/sso/claim-tokens', {
        tokenId,
      });
      return response.data;
    } finally {
      this.isClaimingTokens = false;
    }
  }

  /**
   * 인증 상태 확인
   */
  async getStatus(): Promise<SSOStatusResponse> {
    console.log('SSOService: 인증 상태 확인 요청');
    try {
      const response = await apiClient.get('/v1/sso/status');
      console.log('SSOService: 서버 응답 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('SSOService: 서버 응답 실패:', error);
      // 401 에러는 인증되지 않은 상태를 의미하므로 정상적인 응답으로 처리
      if (error.response?.status === 401) {
        console.log('SSOService: 401 에러 - 인증되지 않음으로 처리');
        return {
          authenticated: false,
          checkedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
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
   * 소셜 로그인 (보안 강화된 리다이렉트 방식만 지원)
   */
  async login(provider: SSOProvider): Promise<void> {
    try {
      const currentUrl = window.location.origin + '/auth/callback';
      const urls = await this.getLoginUrls(currentUrl);

      if (urls[provider]) {
        const loginUrl = `${API_BASE_URL}${urls[provider]}`;
        window.location.href = loginUrl;
      } else {
        throw new Error(`${provider} 로그인 URL을 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  }
}

export const ssoService = new SSOService();
export default SSOService;
