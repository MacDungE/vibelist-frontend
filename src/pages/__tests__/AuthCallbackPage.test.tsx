import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthCallbackPage from '../AuthCallbackPage';
import { getCurrentUserInfo } from '@/http/userApi';
import { authStorageService } from '@/services/authStorageService';

// Mock 모듈들
vi.mock('@/http/userApi');
vi.mock('@/services/authStorageService');
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accessToken이 있을 때 로그인 처리를 진행한다', async () => {
    const mockUserData = { id: 1, name: 'Test User' };
    vi.mocked(getCurrentUserInfo).mockResolvedValue({
      data: mockUserData,
    } as any);

    const { container } = render(
      <MemoryRouter initialEntries={['/auth/callback?accessToken=test-token']}>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    // 로딩 스피너가 표시되는지 확인
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      // 토큰 저장 확인
      expect(authStorageService.setAccessToken).toHaveBeenCalledWith('test-token');
      // 사용자 정보 조회 확인
      expect(getCurrentUserInfo).toHaveBeenCalled();
      // 홈으로 이동 확인
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('로그인 처리 중 오류 발생 시 로그인 페이지로 이동한다', async () => {
    vi.mocked(getCurrentUserInfo).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={['/auth/callback?accessToken=test-token']}>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 토큰 삭제 확인
      expect(authStorageService.clear).toHaveBeenCalled();
      // 로그인 페이지로 이동 확인
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('isNewUser가 true일 때 소셜 회원가입 페이지로 이동한다', () => {
    render(
      <MemoryRouter 
        initialEntries={['/auth/callback?isNewUser=true&provider=google&tempUserInfo=test']}
      >
        <AuthCallbackPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/social-signup?provider=google&tempUserInfo=test',
      { replace: true }
    );
  });

  it('필수 파라미터가 없을 때 로그인 페이지로 이동한다', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('중복 로그인 요청을 방지한다', async () => {
    vi.mocked(getCurrentUserInfo).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: {} } as any), 100))
    );

    const { rerender } = render(
      <MemoryRouter initialEntries={['/auth/callback?accessToken=test-token']}>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    // 컴포넌트 재렌더링으로 중복 호출 시도
    rerender(
      <MemoryRouter initialEntries={['/auth/callback?accessToken=test-token']}>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    // getCurrentUserInfo가 한 번만 호출되었는지 확인
    expect(getCurrentUserInfo).toHaveBeenCalledTimes(1);
  });
});