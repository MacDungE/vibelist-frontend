import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { createUser, checkUsername } from '@/http/userApi';
import { useAuth } from '@/hooks/useAuth';

const SocialSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 쿼리스트링에서 tempUserInfo, provider 추출
  const provider = searchParams.get('provider') || '';
  let tempUserInfo: any = {};
  try {
    tempUserInfo = JSON.parse(decodeURIComponent(searchParams.get('tempUserInfo') || '{}'));
  } catch {
    tempUserInfo = {};
  }

  const [username, setUsername] = useState('');
  const [usernameInputError, setUsernameInputError] = useState('');
  const [name, setName] = useState(tempUserInfo.name || '');
  const [email] = useState(tempUserInfo.email || '');
  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const [usernameMsg, setUsernameMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 닉네임 중복 체크
  const handleCheckUsername = async () => {
    if (!username || username.length < 2) {
      setUsernameMsg('닉네임은 2자 이상이어야 합니다.');
      setUsernameAvailable(false);
      return;
    }
    setChecking(true);
    setUsernameMsg('');
    setUsernameAvailable(null);
    try {
      const res = await checkUsername(username);
      if (res.data.data === true) {
        setUsernameAvailable(true);
        setUsernameMsg('사용 가능한 닉네임입니다!');
      } else {
        setUsernameAvailable(false);
        setUsernameMsg('이미 사용 중인 닉네임입니다.');
      }
    } catch {
      setUsernameAvailable(false);
      setUsernameMsg('닉네임 중복 확인에 실패했습니다.');
    } finally {
      setChecking(false);
    }
  };

  // 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !name) {
      setError('닉네임과 이름을 모두 입력해주세요.');
      return;
    }
    if (usernameAvailable === false) {
      setError('닉네임 중복을 확인해주세요.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username,
        password: '', // 소셜 회원가입은 비밀번호 없음
        email,
        name,
        phone: '',
        role: 'USER',
        provider,
      };
      const res = await createUser(payload);
      // 회원가입 성공 시 바로 로그인 처리 (accessToken 등)
      if (res.data && res.data.accessToken) {
        login(res.data.accessToken, res.data.user);
        navigate('/', { replace: true });
      } else {
        navigate('/login');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4'>
      <div className='mt-10 mb-10 w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-xl'>
        <h1 className='mb-2 text-center text-2xl font-bold text-indigo-700'>닉네임 설정</h1>
        <p className='mb-6 text-center text-gray-500'>
          VibeList에 오신 것을 환영합니다!
          <br />
          닉네임과 이름을 입력해 주세요.
        </p>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>닉네임(아이디)</label>
            <div className='flex gap-2'>
              <input
                type='text'
                className={`flex-1 rounded-lg border px-4 py-3 text-[15px] transition focus:outline-none ${usernameAvailable === false ? 'border-red-400' : usernameAvailable === true ? 'border-green-400' : 'border-gray-200'}`}
                style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
                value={username}
                onChange={e => {
                  const value = e.target.value;
                  setUsername(value); // 항상 입력값 업데이트
                  if (/^[가-힣A-Za-z0-9_]*$/.test(value)) {
                    setUsernameInputError('');
                    setUsernameAvailable(null);
                    setUsernameMsg('');
                  } else {
                    setUsernameInputError(
                      '닉네임은 한글, 영문, 숫자, 언더바(_)만 사용할 수 있습니다.'
                    );
                  }
                }}
                minLength={2}
                maxLength={20}
                placeholder='닉네임을 입력하세요'
                autoFocus
                autoComplete='off'
              />
              <button
                type='button'
                className='rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:bg-gray-300'
                onClick={handleCheckUsername}
                disabled={checking || !username || !!usernameInputError}
              >
                {checking ? '확인중...' : '중복확인'}
              </button>
            </div>
            {usernameInputError && (
              <div className='mt-1 text-xs text-red-500'>{usernameInputError}</div>
            )}
            {usernameMsg && !usernameInputError && (
              <div
                className={`mt-1 text-xs ${usernameAvailable ? 'text-green-600' : 'text-red-500'}`}
              >
                {usernameMsg}
              </div>
            )}
          </div>
          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>이름</label>
            <input
              type='text'
              className='w-full rounded-lg border border-gray-200 px-4 py-3 text-[15px] focus:outline-none'
              style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='이름을 입력하세요'
              required
            />
          </div>
          {error && <div className='text-center text-sm text-red-500'>{error}</div>}
          <button
            type='submit'
            className='w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-lg font-bold text-white shadow-md transition hover:from-indigo-600 hover:to-purple-600 disabled:bg-gray-300 disabled:text-gray-400'
            disabled={
              loading || !username || !name || usernameAvailable !== true || !!usernameInputError
            }
          >
            {loading ? (
              <span className='mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent align-middle'></span>
            ) : null}
            가입 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocialSignupPage;
