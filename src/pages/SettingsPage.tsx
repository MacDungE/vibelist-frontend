import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { deleteMe } from '@/http/userApi';
import { spotifyApi, disconnectProvider, getValidProviderIntegration } from '@/http/integrationApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUserSocialAccounts } from '@/queries';
import { API_BASE_URL } from '@/constants/api';
import { getProviderDetails } from '@/constants/provider';
import { isEmpty } from 'lodash';
import type { SocialAccount } from '@/types/auth.ts';

interface SpotifyConnection {
  isConnected: boolean;
  accountType: 'premium' | 'free';
  username?: string;
  scope?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth(); // loginProvider 제거
  const queryClient = useQueryClient();
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection>({
    isConnected: false,
    accountType: 'free',
    username: undefined,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApiInfoModal, setShowApiInfoModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 소셜 계정 정보 조회
  const { data: socialAccounts } = useCurrentUserSocialAccounts();

  const currentProvider = useMemo(() => {
    const value: SocialAccount[] = socialAccounts?.data;
    if (isEmpty(value)) {
      return null;
    }

    return value.at(0)?.provider?.toLowerCase();
  }, [socialAccounts]);

  useEffect(() => {
    console.log(socialAccounts);
  }, [socialAccounts]);

  // Spotify 유효성 검사
  const { data: spotifyValidity } = useQuery({
    queryKey: ['spotifyValidity'],
    queryFn: async () => {
      try {
        const response = await getValidProviderIntegration('spotify');
        return response.data;
      } catch (error) {
        console.error('Failed to check Spotify validity:', error);
        return { isValid: false };
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // 30초마다 유효성 재확인
  });

  // Spotify 연동 성공 후 리다이렉트 처리
  useEffect(() => {
    const spotifyConnected = searchParams.get('spotify_connected');
    if (spotifyConnected === 'true') {
      // URL 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('spotify_connected');
      navigate(
        {
          pathname: '/settings',
          search: newSearchParams.toString(),
        },
        { replace: true }
      );

      // Spotify 유효성 상태 다시 조회
      queryClient.invalidateQueries({ queryKey: ['spotifyValidity'] });
    }
  }, [searchParams, navigate, queryClient]);

  // Spotify 연동 상태 업데이트
  useEffect(() => {
    if (spotifyValidity !== undefined) {
      setSpotifyConnection({
        isConnected: spotifyValidity.isValid,
        accountType: 'free', // 실제 계정 타입은 별도 API로 확인 필요
        username: spotifyValidity.isValid ? user?.name : undefined,
      });
    }
  }, [spotifyValidity, user]);

  // Spotify 연동 해제 mutation
  const disconnectSpotifyMutation = useMutation({
    mutationFn: () => disconnectProvider('spotify'),
    onSuccess: () => {
      setSpotifyConnection(prev => ({ ...prev, isConnected: false }));
      // 유효성 상태 다시 확인
      queryClient.invalidateQueries({ queryKey: ['spotifyValidity'] });
    },
    onError: error => {
      console.error('Failed to disconnect Spotify:', error);
      alert('Spotify 연동 해제에 실패했습니다.');
    },
  });

  const handleSpotifyToggle = async () => {
    if (spotifyConnection.isConnected) {
      // 연동 해제
      if (confirm('Spotify 연동을 해제하시겠습니까?')) {
        disconnectSpotifyMutation.mutate();
      }
    } else {
      // 연동 시작
      setIsConnecting(true);
      try {
        const response = await spotifyApi.connect();
        const redirectUrl = response.data.data.redirectUrl;

        // 백엔드 URL과 결합하여 완전한 URL 생성
        window.location.href = `${API_BASE_URL}${redirectUrl}`;
      } catch (error) {
        console.error('Failed to start Spotify connection:', error);
        alert('Spotify 연동을 시작할 수 없습니다.');
        setIsConnecting(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    // AuthGuard가 자동으로 리디렉션 처리하므로 navigate 호출은 선택사항.
    // 명시적으로 처리하고 싶다면 유지할 수 있습니다.
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMe();
      setShowDeleteModal(false);
      logout();
      navigate('/login');
    } catch {
      setDeleteError('계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className='min-h-screen w-full font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        {/* Header */}
        <div className='flex min-h-0 w-full flex-1 flex-col p-4'>
          <div className='mb-6'>
            <h1 className='mb-2 text-2xl font-bold'>설정</h1>
            <p className='text-sm text-gray-500'>계정 및 서비스 설정을 관리하세요</p>
          </div>

          {/* Profile Card */}
          <div className='mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]'>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt='Profile'
                    className='h-12 w-12 rounded-full object-cover'
                  />
                ) : (
                  <i className='fas fa-user text-lg text-white'></i>
                )}
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-800'>{user?.name || '사용자'}</h3>
                <div className='mt-1 flex gap-2'>
                  {currentProvider && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getProviderDetails(currentProvider).color}`}
                    >
                      <i className={`${getProviderDetails(currentProvider).icon} mr-1`}></i>
                      {getProviderDetails(currentProvider).displayName} 로그인
                    </span>
                  )}
                  {spotifyConnection.isConnected && (
                    <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs text-green-700'>
                      <i className='fab fa-spotify mr-1'></i>
                      Spotify 연동 ON
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections  @todo 로그인한 provider 보이게하고 연동 로직 단수화 하기, 연동하는거 버튼으로 만들기*/}
          <div className='space-y-4'>
            {/* Account Section */}
            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
              <div className='border-b border-gray-100 px-4 py-3'>
                <h3 className='font-semibold text-gray-800'>내 계정</h3>
              </div>

              {/* Spotify Connection */}
              <div className='border-b border-gray-50 px-4 py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <i className='fas fa-link text-gray-500'></i>
                    <div>
                      <div className='font-medium text-gray-800'>Spotify 연동</div>
                      <div className='text-sm text-gray-500'>
                        {spotifyConnection.isConnected ? '연동됨' : '음악 서비스와 연결하세요'}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={handleSpotifyToggle}
                      disabled={isConnecting || disconnectSpotifyMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spotifyConnection.isConnected ? 'bg-indigo-600' : 'bg-gray-200'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spotifyConnection.isConnected ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className='border-b border-gray-50 px-4 py-3'>
                <button
                  onClick={handleLogout}
                  className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'
                >
                  <i className='fas fa-sign-out-alt text-gray-500'></i>
                  <span className='font-medium text-gray-800'>로그아웃</span>
                </button>
              </div>

              {/* Delete Account */}
              <div className='px-4 py-3'>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-red-50'
                >
                  <i className='fas fa-trash-alt text-red-500'></i>
                  <span className='font-medium text-red-600'>계정 삭제</span>
                </button>
              </div>
            </div>

            {/* Privacy & Security Section */}
            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
              <div className='border-b border-gray-100 px-4 py-3'>
                <h3 className='font-semibold text-gray-800'>개인정보·보안</h3>
              </div>

              <div className='border-b border-gray-50 px-4 py-3'>
                <button className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'>
                  <i className='fas fa-shield-alt text-gray-500'></i>
                  <span className='font-medium text-gray-800'>개인정보 처리방침</span>
                </button>
              </div>

              <div className='border-b border-gray-50 px-4 py-3'>
                <button
                  onClick={() => setShowApiInfoModal(true)}
                  className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'
                >
                  <i className='fas fa-book text-gray-500'></i>
                  <span className='font-medium text-gray-800'>API 이용 안내</span>
                </button>
              </div>

              <div className='px-4 py-3'>
                <button className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'>
                  <i className='fas fa-ban text-gray-500'></i>
                  <span className='font-medium text-gray-800'>차단 목록</span>
                </button>
              </div>
            </div>

            {/* Support Section */}
            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
              <div className='border-b border-gray-100 px-4 py-3'>
                <h3 className='font-semibold text-gray-800'>지원</h3>
              </div>

              <div className='border-b border-gray-50 px-4 py-3'>
                <button className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'>
                  <i className='fas fa-question-circle text-gray-500'></i>
                  <span className='font-medium text-gray-800'>도움말 / FAQ</span>
                </button>
              </div>

              <div className='px-4 py-3'>
                <button className='-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50'>
                  <i className='fas fa-info-circle text-gray-500'></i>
                  <span className='font-medium text-gray-800'>버전 & OSS 라이선스</span>
                  <span className='ml-auto text-sm text-gray-400'>v1.0.0</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-md rounded-2xl bg-white p-6'>
              <div className='mb-6 text-center'>
                <i className='fas fa-exclamation-triangle mb-4 text-4xl text-red-500'></i>
                <h3 className='mb-2 text-xl font-semibold text-gray-800'>계정 삭제</h3>
                <p className='text-gray-600'>
                  모든 데이터가 영구적으로 삭제됩니다.
                  <br />이 작업은 되돌릴 수 없습니다.
                </p>
                {deleteError && <div className='mt-3 text-sm text-red-500'>{deleteError}</div>}
              </div>
              <div className='flex gap-3'>
                <button
                  className='flex-1 rounded-lg bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200'
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  취소
                </button>
                <button
                  className='flex-1 rounded-lg bg-red-500 py-3 font-medium text-white transition-all hover:bg-red-600 disabled:bg-red-300'
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? '삭제중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Info Modal */}
        {showApiInfoModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
            <div className='max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-800'>API 이용 안내</h3>
                <button
                  onClick={() => setShowApiInfoModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
              <div className='space-y-4 text-sm text-gray-600'>
                <p>
                  본 서비스는 <strong>Spotify Web API</strong>를 사용합니다.
                </p>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-800'>필요한 권한:</h4>
                  <ul className='ml-4 space-y-1'>
                    <li>
                      • <code className='rounded bg-gray-100 px-1'>streaming</code> - 음악 재생
                    </li>
                    <li>
                      • <code className='rounded bg-gray-100 px-1'>user-library</code> -
                      플레이리스트 접근
                    </li>
                    <li>
                      • <code className='rounded bg-gray-100 px-1'>playlist-modify</code> -
                      플레이리스트 생성/수정
                    </li>
                  </ul>
                </div>
                <p>
                  사용자는 언제든{' '}
                  <a
                    href='https://www.spotify.com/account/apps/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-indigo-600 hover:underline'
                  >
                    Spotify 앱 관리 페이지
                  </a>
                  에서 권한을 철회할 수 있습니다.
                </p>
              </div>
              <div className='mt-6'>
                <button
                  className='w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition-all hover:bg-indigo-700'
                  onClick={() => setShowApiInfoModal(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
