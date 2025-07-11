import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SpotifyConnection {
  isConnected: boolean;
  accountType: 'premium' | 'free';
  username?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginProvider, logout } = useAuth();
  const [spotifyConnection, setSpotifyConnection] = useState<SpotifyConnection>({
    isConnected: loginProvider === 'spotify',
    accountType: 'premium',
    username: user?.name
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApiInfoModal, setShowApiInfoModal] = useState(false);

  const handleSpotifyToggle = () => {
    if (spotifyConnection.isConnected) {
      // Disconnect logic
      setSpotifyConnection(prev => ({ ...prev, isConnected: false }));
    } else {
      // Connect logic - start PKCE flow
      setSpotifyConnection(prev => ({ ...prev, isConnected: true }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    // Delete account logic
    setShowDeleteModal(false);
    logout();
    navigate('/login');
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'spotify':
        return 'Spotify';
      case 'kakao':
        return '카카오';
      case 'google':
        return 'Google';
      default:
        return provider;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'spotify':
        return 'fab fa-spotify';
      case 'kakao':
        return 'fas fa-comment';
      case 'google':
        return 'fab fa-google';
      default:
        return 'fas fa-user';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'spotify':
        return 'bg-green-50 text-green-700';
      case 'kakao':
        return 'bg-yellow-50 text-yellow-700';
      case 'google':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen w-full font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        {/* Header */}
        <div className="w-full flex-1 flex flex-col p-4 min-h-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">설정</h1>
            <p className="text-sm text-gray-500">계정 및 서비스 설정을 관리하세요</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <i className="fas fa-user text-white text-lg"></i>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{user?.name || '사용자'}</h3>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getProviderColor(loginProvider || '')}`}>
                    <i className={`${getProviderIcon(loginProvider || '')} mr-1`}></i>
                    {getProviderDisplayName(loginProvider || '')} 로그인
                  </span>
                  {spotifyConnection.isConnected && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      <i className="fab fa-spotify mr-1"></i>
                      Spotify 연동 ON
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* Account Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">내 계정</h3>
              </div>
              
              {/* Spotify Connection */}
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-link text-gray-500"></i>
                    <div>
                      <div className="font-medium text-gray-800">Spotify 연동</div>
                      <div className="text-sm text-gray-500">
                        {spotifyConnection.isConnected 
                          ? `${spotifyConnection.accountType === 'premium' ? '프리미엄 ✓' : '프리 계정'}`
                          : '음악 서비스와 연결하세요'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {spotifyConnection.isConnected && spotifyConnection.accountType === 'free' && (
                      <button className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                        Premium 업그레이드
                      </button>
                    )}
                    <button
                      onClick={handleSpotifyToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spotifyConnection.isConnected ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
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
              <div className="px-4 py-3 border-b border-gray-50">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-sign-out-alt text-gray-500"></i>
                  <span className="font-medium text-gray-800">로그아웃</span>
                </button>
              </div>

              {/* Delete Account */}
              <div className="px-4 py-3">
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-3 w-full text-left hover:bg-red-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-trash-alt text-red-500"></i>
                  <span className="font-medium text-red-600">계정 삭제</span>
                </button>
              </div>
            </div>

            {/* Privacy & Security Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">개인정보·보안</h3>
              </div>
              
              <div className="px-4 py-3 border-b border-gray-50">
                <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                  <i className="fas fa-shield-alt text-gray-500"></i>
                  <span className="font-medium text-gray-800">개인정보 처리방침</span>
                </button>
              </div>

              <div className="px-4 py-3 border-b border-gray-50">
                <button 
                  onClick={() => setShowApiInfoModal(true)}
                  className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-book text-gray-500"></i>
                  <span className="font-medium text-gray-800">API 이용 안내</span>
                </button>
              </div>

              <div className="px-4 py-3">
                <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                  <i className="fas fa-ban text-gray-500"></i>
                  <span className="font-medium text-gray-800">차단 목록</span>
                </button>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">지원</h3>
              </div>
              
              <div className="px-4 py-3 border-b border-gray-50">
                <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                  <i className="fas fa-question-circle text-gray-500"></i>
                  <span className="font-medium text-gray-800">도움말 / FAQ</span>
                </button>
              </div>

              <div className="px-4 py-3">
                <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                  <i className="fas fa-info-circle text-gray-500"></i>
                  <span className="font-medium text-gray-800">버전 & OSS 라이선스</span>
                  <span className="ml-auto text-sm text-gray-400">v1.0.0</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="text-center mb-6">
                <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">계정 삭제</h3>
                <p className="text-gray-600">
                  모든 데이터가 영구적으로 삭제됩니다.<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  onClick={() => setShowDeleteModal(false)}
                >
                  취소
                </button>
                <button
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all"
                  onClick={handleDeleteAccount}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Info Modal */}
        {showApiInfoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">API 이용 안내</h3>
                <button
                  onClick={() => setShowApiInfoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  본 서비스는 <strong>Spotify Web API</strong>를 사용합니다.
                </p>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">필요한 권한:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• <code className="bg-gray-100 px-1 rounded">streaming</code> - 음악 재생</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">user-library</code> - 플레이리스트 접근</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">playlist-modify</code> - 플레이리스트 생성/수정</li>
                  </ul>
                </div>
                <p>
                  사용자는 언제든 <a href="https://www.spotify.com/account/apps/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Spotify 앱 관리 페이지</a>에서 권한을 철회할 수 있습니다.
                </p>
              </div>
              <div className="mt-6">
                <button
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-all"
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