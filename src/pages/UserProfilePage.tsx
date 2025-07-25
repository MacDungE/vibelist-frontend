import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentUserInfo,
  getUserInfo,
  searchUsers,
  updateCurrentUserProfile,
} from '@/http/userApi';
import { getUserLikedPosts, getUserPosts } from '@/http/postApi';

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
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const loaderRef = useRef<HTMLDivElement | null>(null);

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

  // 무한스크롤 IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (tab === 'posts' && !postsLoading && page < totalPages - 1) {
            setPage(p => p + 1);
          } else if (tab === 'likes' && !likesLoading && page < totalPages - 1) {
            setPage(p => p + 1);
          }
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [tab, postsLoading, likesLoading, page, totalPages]);

  // posts/likedPosts append 구조로 변경
  useEffect(() => {
    if (!username) return;
    setPostsLoading(true);
    getUserPosts(username, page, size)
      .then(res => {
        const data = res.data.data;
        setPosts(prev =>
          page === 0
            ? (data.content || []).map((post: any) => ({
                ...post,
                user: post.user || {
                  name: post.userProfileName || post.userName || '',
                  username: post.userName || '',
                  avatar: profile?.avatarUrl || '',
                },
              }))
            : [
                ...prev,
                ...(data.content || []).map((post: any) => ({
                  ...post,
                  user: post.user || {
                    name: post.userProfileName || post.userName || '',
                    username: post.userName || '',
                    avatar: profile?.avatarUrl || '',
                  },
                })),
              ]
        );
        setTotalPages(data.totalPages);
        setPostsLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setPostsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, page, size, tab]);

  useEffect(() => {
    if (!username || tab !== 'likes') return;
    setLikesLoading(true);
    getUserLikedPosts(username, page, size)
      .then(res => {
        const data = res.data.data;
        setLikedPosts(prev =>
          page === 0
            ? (data.content || []).map((post: any) => ({
                ...post,
                user: post.user || {
                  name: post.userProfileName || post.userName || '',
                  username: post.userName || '',
                  avatar: post.avatarUrl || '',
                },
              }))
            : [
                ...prev,
                ...(data.content || []).map((post: any) => ({
                  ...post,
                  user: post.user || {
                    name: post.userProfileName || post.userName || '',
                    username: post.userName || '',
                    avatar: post.avatarUrl || '',
                  },
                })),
              ]
        );
        setTotalPages(data.totalPages);
        setLikesLoading(false);
      })
      .catch(() => {
        setLikedPosts([]);
        setLikesLoading(false);
      });
  }, [username, tab, page, size]);

  // 탭 변경 시 페이지/리스트 초기화
  useEffect(() => {
    setPage(0);
    setPosts([]);
    setLikedPosts([]);
  }, [tab, username]);

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
            onClick={() => {
              setTab('posts');
              setPage(0);
            }}
          >
            작성한 포스트
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm font-semibold ${tab === 'likes' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => {
              setTab('likes');
              setPage(0);
            }}
          >
            좋아요한 포스트
          </button>
        </div>
        {/* 포스트 목록 */}
        <section>
          {tab === 'posts' ? (
            postsLoading && posts.length === 0 ? (
              <div className='py-12 text-center text-gray-400'>포스트 불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className='py-12 text-center text-gray-400'>아직 포스트가 없습니다.</div>
            ) : (
              <div className='grid grid-cols-1 gap-3'>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} showAuthor={true} isDarkMode={false} />
                ))}
                {/* 무한스크롤 로더 */}
                <div ref={loaderRef} style={{ height: 32 }} />
                {postsLoading && (
                  <div className='py-4 text-center text-gray-400'>불러오는 중...</div>
                )}
                {page >= totalPages - 1 && posts.length > 0 && (
                  <div className='py-4 text-center text-gray-400'>마지막 페이지입니다.</div>
                )}
              </div>
            )
          ) : likesLoading && likedPosts.length === 0 ? (
            <div className='py-12 text-center text-gray-400'>좋아요한 포스트 불러오는 중...</div>
          ) : likedPosts.length === 0 ? (
            <div className='py-12 text-center text-gray-400'>좋아요한 포스트가 없습니다.</div>
          ) : (
            <div className='grid grid-cols-1 gap-3'>
              {likedPosts.map(post => (
                <PostCard key={post.id} post={post} showAuthor={true} isDarkMode={false} />
              ))}
              {/* 무한스크롤 로더 */}
              <div ref={loaderRef} style={{ height: 32 }} />
              {likesLoading && <div className='py-4 text-center text-gray-400'>불러오는 중...</div>}
              {page >= totalPages - 1 && likedPosts.length > 0 && (
                <div className='py-4 text-center text-gray-400'>마지막 페이지입니다.</div>
              )}
            </div>
          )}
        </section>
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className='my-6 flex justify-center gap-2'>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`rounded px-3 py-1 text-sm font-semibold ${page === idx ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setPage(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
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
