import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentUserInfo,
  searchUsers,
  getUserInfo,
  updateCurrentUserProfile,
} from '@/http/userApi';
import { getLikedPostsByUser } from '@/http/postApi';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isMine, setIsMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'posts' | 'likes'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    if (!user?.username) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    if (user?.username === username) {
      setIsMine(true);
      getCurrentUserInfo()
        .then(res => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('내 프로필 정보를 불러오지 못했습니다.');
          setLoading(false);
        });
    } else {
      setIsMine(false);
      searchUsers(username)
        .then(res => {
          const found = res.data.data.find((u: any) => u.username === username);
          if (found) {
            getUserInfo(found.userId)
              .then(res2 => {
                setProfile(res2.data);
                setLoading(false);
              })
              .catch(() => {
                setError('유저 정보를 불러오지 못했습니다.');
                setLoading(false);
              });
          } else {
            setError('존재하지 않는 유저입니다.');
            setLoading(false);
          }
        })
        .catch(() => {
          setError('유저 정보를 불러오지 못했습니다.');
          setLoading(false);
        });
    }
  }, [username, user]);

  useEffect(() => {
    if (profile && isMine) {
      setEditName(profile.name || '');
      setEditBio(profile.bio || '');
      setEditAvatar(profile.avatarUrl || '');
    }
  }, [profile, isMine]);

  const handleEditProfile = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await updateCurrentUserProfile({ name: editName, bio: editBio, avatarUrl: editAvatar });
      setShowEditModal(false);
      // 프로필 정보 새로고침
      getCurrentUserInfo().then(res => setProfile(res.data));
    } catch (e) {
      setEditError('프로필 수정에 실패했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  // 내 포스트 목록 (TODO: API 연결 필요, 현재는 profile.posts로 가정)
  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    // 예시: profile.posts가 있다면 사용, 실제로는 별도 API 필요
    if (profile.posts) {
      setPosts(profile.posts);
      setPostsLoading(false);
    } else {
      // TODO: posts API 연결 필요
      setPosts([]);
      setPostsLoading(false);
    }
  }, [profile]);

  // 좋아요한 포스트 목록
  useEffect(() => {
    if (!isMine || tab !== 'likes') return;
    setLikesLoading(true);
    getLikedPostsByUser()
      .then(res => {
        setLikedPosts(res.data.data || []);
        setLikesLoading(false);
      })
      .catch(() => {
        setLikedPosts([]);
        setLikesLoading(false);
      });
  }, [isMine, tab]);

  if (loading) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center text-gray-600'>
        로딩 중...
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center text-gray-600'>
        <h2 className='mb-4 text-2xl font-bold'>{error || '존재하지 않는 유저입니다.'}</h2>
        <button className='rounded bg-indigo-500 px-4 py-2 text-white' onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-[#F9F9F9] font-sans'>
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        {/* Profile Card */}
        <section className='mx-auto mb-8 w-full'>
          <div className='flex items-center gap-8 rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-8 py-4'>
            <img
              src={
                profile.avatarUrl ||
                'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=128&height=128&seq=avatar1&orientation=squarish'
              }
              alt='프로필'
              className='h-16 w-16 rounded-full object-cover'
            />
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <span className='truncate text-base font-bold text-[var(--text-primary)]'>
                  {profile.name}
                </span>
                <span className='truncate text-xs text-[var(--text-secondary)]'>
                  @{profile.username}
                </span>
              </div>
              {/* 소개글: 왼쪽 정렬, 전체 표시 */}
              <div className='text-left text-xs whitespace-pre-line text-[var(--text-secondary)]'>
                {profile.bio || ''}
              </div>
              {/* 받은 좋아요(하트)만 표시 (TODO: API에서 제공 시 반영) */}
              {/* <div className="text-xs text-[var(--text-secondary)] flex items-center gap-3">
                <span><i className="fas fa-heart text-pink-400 mr-1"></i>받은 좋아요 <b>{userPosts.reduce((acc, p) => acc + (p.likes || 0), 0)}</b></span>
              </div> */}
              {isMine && (
                <div className='mt-2 flex gap-2'>
                  <button
                    className='rounded bg-indigo-500 px-3 py-1 text-xs font-semibold text-white'
                    onClick={() => setShowEditModal(true)}
                  >
                    프로필 편집
                  </button>
                  <button
                    className='rounded bg-gray-200 px-3 py-1 text-xs font-semibold'
                    onClick={() => navigate('/settings')}
                  >
                    설정
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* 탭: 내 포스트 / 좋아요한 포스트 */}
        <div className='mb-4 flex gap-4 px-8'>
          <button
            className={`rounded-full px-3 py-1 text-sm font-semibold ${tab === 'posts' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('posts')}
          >
            내 포스트
          </button>
          {isMine && (
            <button
              className={`rounded-full px-3 py-1 text-sm font-semibold ${tab === 'likes' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('likes')}
            >
              좋아요한 포스트
            </button>
          )}
        </div>
        {/* 포스트 목록 */}
        <section>
          {tab === 'posts' ? (
            postsLoading ? (
              <div className='py-12 text-center text-gray-400'>포스트 불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className='py-12 text-center text-gray-400'>아직 포스트가 없습니다.</div>
            ) : (
              <div className='grid grid-cols-1 gap-3'>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} showAuthor={true} isDarkMode={false} />
                ))}
              </div>
            )
          ) : likesLoading ? (
            <div className='py-12 text-center text-gray-400'>좋아요한 포스트 불러오는 중...</div>
          ) : likedPosts.length === 0 ? (
            <div className='py-12 text-center text-gray-400'>좋아요한 포스트가 없습니다.</div>
          ) : (
            <div className='grid grid-cols-1 gap-3'>
              {likedPosts.map(post => (
                <PostCard key={post.id} post={post} showAuthor={true} isDarkMode={false} />
              ))}
            </div>
          )}
        </section>
      </div>
      {/* 프로필 편집 모달 */}
      {showEditModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl'>
            <button
              className='absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700'
              onClick={() => setShowEditModal(false)}
            >
              &times;
            </button>
            <h2 className='mb-4 text-lg font-bold'>프로필 편집</h2>
            <div className='mb-3'>
              <label className='mb-1 block text-xs font-semibold'>닉네임</label>
              <input
                className='w-full rounded border px-3 py-2 text-sm'
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className='mb-3'>
              <label className='mb-1 block text-xs font-semibold'>소개글</label>
              <textarea
                className='w-full rounded border px-3 py-2 text-sm'
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                maxLength={100}
              />
            </div>
            <div className='mb-4'>
              <label className='mb-1 block text-xs font-semibold'>프로필 이미지 URL</label>
              <input
                className='w-full rounded border px-3 py-2 text-sm'
                value={editAvatar}
                onChange={e => setEditAvatar(e.target.value)}
              />
              {editAvatar && (
                <img
                  src={editAvatar}
                  alt='미리보기'
                  className='mt-2 h-16 w-16 rounded-full object-cover'
                />
              )}
            </div>
            {editError && <div className='mb-2 text-xs text-red-500'>{editError}</div>}
            <div className='flex gap-2'>
              <button
                className='flex-1 rounded bg-indigo-500 py-2 text-xs font-semibold text-white'
                onClick={handleEditProfile}
                disabled={editLoading}
              >
                {editLoading ? '저장 중...' : '저장'}
              </button>
              <button
                className='flex-1 rounded bg-gray-200 py-2 text-xs font-semibold'
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
