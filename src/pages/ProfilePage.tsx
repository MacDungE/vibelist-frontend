import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotifyPlayerModal from '@/components/common/SpotifyPlayerModal';
import PostCard from '@/components/common/PostCard';
import type { Post } from '@/components/common/PostCard';

import { Button } from '@/components/ui/button';

// Mock data for posts and liked posts
const myPosts: Post[] = [
  {
    id: 1,
    description: '조용한 새벽에 듣기 좋은 감성적인 곡들을 모았습니다',
    likes: 24,
    comments: 8,
    isPrivate: false,
    createdAt: '2일 전',
    tags: ['Chill', 'Lofi', '감성'],
    trackCount: 12,
    duration: '45분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
    playlist: [
      { id: 1, artist: 'DRWN.', duration: '1:33' },
      { id: 2, artist: 'potsu', duration: '2:10' },
      { id: 3, artist: 'eevee', duration: '2:42' },
    ],
  },
  {
    id: 2,
    description: '에너지 넘치는 운동용 플레이리스트',
    thumbnail:
      'https://readdy.ai/api/search-image?query=modern%20gym%20interior%20with%20purple%20neon%20lighting%20and%20sleek%20equipment%2C%20energetic%20workout%20atmosphere%20with%20dynamic%20lighting%20effects&width=300&height=200&seq=post2&orientation=landscape',
    likes: 156,
    comments: 32,
    isPrivate: true,
    createdAt: '5일 전',
    tags: ['Workout', 'Energy', 'Pop'],
    trackCount: 10,
    duration: '38분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP',
    playlist: [
      { id: 1, artist: 'Kanye West', duration: '5:12' },
      { id: 2, artist: 'David Guetta', duration: '4:05' },
    ],
  },
  {
    id: 3,
    description: '창밖으로 내리는 비를 보며 듣기 좋은 재즈 모음',
    thumbnail:
      'https://readdy.ai/api/search-image?query=rainy%20window%20view%20with%20jazz%20cafe%20interior%2C%20soft%20purple%20ambient%20lighting%20and%20vintage%20music%20equipment%20in%20cozy%20atmosphere&width=300&height=200&seq=post3&orientation=landscape',
    likes: 89,
    comments: 15,
    isPrivate: false,
    createdAt: '1주 전',
    tags: ['Jazz', 'Rainy', '감성'],
    trackCount: 8,
    duration: '32분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXbITWG1ZJKYt',
    playlist: [
      { id: 1, artist: 'Bill Evans', duration: '5:58' },
      { id: 2, artist: 'Miles Davis', duration: '5:37' },
    ],
  },
];
const likedPosts: Post[] = [
  {
    id: 4,
    description: '숲속의 새소리와 함께하는 명상 음악',
    thumbnail:
      'https://readdy.ai/api/search-image?query=peaceful%20forest%20scene%20with%20soft%20purple%20morning%20light%20filtering%20through%20trees%2C%20serene%20nature%20atmosphere%20with%20gentle%20ambient%20glow&width=300&height=200&seq=liked1&orientation=landscape',
    likes: 203,
    comments: 45,
    isPrivate: false,
    createdAt: '3일 전',
    author: '자연음악러버',
    tags: ['Nature', 'Healing', 'Ambient'],
    trackCount: 14,
    duration: '50분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DWU0ScTcjJBdj',
    playlist: [
      { id: 1, artist: 'Nature Sound', duration: '3:20' },
      { id: 2, artist: 'Relaxing Nature', duration: '2:45' },
    ],
  },
  {
    id: 5,
    description: '추억의 90년대 가요 베스트 컬렉션',
    thumbnail:
      'https://readdy.ai/api/search-image?query=retro%2090s%20music%20studio%20with%20vintage%20equipment%20and%20purple%20neon%20lights%2C%20nostalgic%20atmosphere%20with%20classic%20recording%20gear&width=300&height=200&seq=liked2&orientation=landscape',
    likes: 342,
    comments: 78,
    isPrivate: false,
    createdAt: '1주 전',
    author: '추억여행자',
    tags: ['K-POP', '90s', 'Retro'],
    trackCount: 20,
    duration: '1시간 10분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX9tPFwDMOaN1',
    playlist: [
      { id: 1, artist: '서태지와 아이들', duration: '4:12' },
      { id: 2, artist: '김정민', duration: '4:35' },
    ],
  },
];

const initialProfile = {
  name: '음악러버',
  username: '@musiclover2024',
  bio: '감정에 따라 음악을 추천받고 나만의 플레이리스트를 만들어가는 중입니다. 다양한 장르의 음악을 사랑하며, 특히 새벽 감성과 재즈를 좋아해요.',
  avatar:
    'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20young%20person%20with%20friendly%20smile%2C%20soft%20purple%20lighting%20background%2C%20modern%20aesthetic%20profile%20picture%20style&width=128&height=128&seq=avatar&orientation=squarish',
  likes: 269,
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');

  const [spotifyModalUri, setSpotifyModalUri] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(initialProfile);
  const [editSuccess, setEditSuccess] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleEditOpen = () => {
    setEditProfile(profile);
    setEditOpen(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditSuccess(false);
  };
  const handleEditSave = () => {
    if (!editProfile.name.trim() || !editProfile.username.trim()) {
      alert('이름과 유저네임을 입력해주세요.');
      return;
    }
    setProfile(editProfile);
    setEditOpen(false);
    setEditSuccess(true);
    setTimeout(() => setEditSuccess(false), 2000);
  };

  // Open modal

  // Modal for Spotify Player
  return (
    <div
      className='min-h-screen w-full font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        {/* Flat Profile Card */}
        <section className='mx-auto mt-2 mb-6 w-full'>
          <div className='flex items-center gap-8 rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-8 py-4'>
            {/* gap-4 → gap-6로 아바타-정보 간 여백 확대 */}
            <img
              src={profile.avatar}
              alt='프로필'
              className='h-16 w-16 rounded-full object-cover'
            />
            {/* 프로필 정보 */}
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <span className='truncate text-base font-bold text-[var(--text-primary)]'>
                  {profile.name}
                </span>
                <span className='truncate text-xs text-[var(--text-secondary)]'>
                  {profile.username}
                </span>
              </div>
              {/* 소개글: 왼쪽 정렬, 전체 표시 */}
              <div className='text-left text-xs whitespace-pre-line text-[var(--text-secondary)]'>
                {profile.bio}
              </div>
              {/* 받은 좋아요(하트)만 표시 */}
              <div className='flex items-center gap-3 text-xs text-[var(--text-secondary)]'>
                <span>
                  <i className='fas fa-heart mr-1 text-pink-400'></i>받은 좋아요{' '}
                  <b>{profile.likes}</b>
                </span>
              </div>
            </div>
            {/* Profile Edit and Settings Buttons */}
            <div className='flex items-center gap-3'>
              <button
                onClick={handleEditOpen}
                className='text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]'
                aria-label='프로필 편집'
              >
                프로필 편집
              </button>
              <button
                onClick={() => navigate('/setting')}
                className='text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]'
                aria-label='설정'
              >
                설정
              </button>
            </div>
          </div>
        </section>
        {/* Edit Profile Modal */}
        {editOpen && (
          <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/30'>
            <div
              className='relative w-full max-w-md rounded-t-[20px] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]'
              style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            >
              <button
                className='absolute top-4 right-4 text-[#AAA] hover:text-[#444]'
                onClick={handleEditClose}
              >
                <i className='fas fa-times text-xl'></i>
              </button>
              <h3 className='mb-6 text-[20px] font-bold text-[#222]'>프로필 편집</h3>
              <div className='flex flex-col gap-4'>
                <label className='flex flex-col gap-1'>
                  <span className='text-[14px] font-medium text-[#444]'>이름</span>
                  <input
                    ref={nameInputRef}
                    className='rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-[#222] focus:ring-2 focus:ring-[#1DB954] focus:outline-none'
                    value={editProfile.name}
                    onChange={e => setEditProfile({ ...editProfile, name: e.target.value })}
                    required
                  />
                </label>
                <label className='flex flex-col gap-1'>
                  <span className='text-[14px] font-medium text-[#444]'>유저네임</span>
                  <input
                    className='rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-[#222] focus:ring-2 focus:ring-[#1DB954] focus:outline-none'
                    value={editProfile.username}
                    onChange={e => setEditProfile({ ...editProfile, username: e.target.value })}
                    required
                  />
                </label>
                <label className='flex flex-col gap-1'>
                  <span className='text-[14px] font-medium text-[#444]'>소개</span>
                  <textarea
                    className='min-h-[80px] rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-[#222] focus:ring-2 focus:ring-[#1DB954] focus:outline-none'
                    value={editProfile.bio}
                    onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                  />
                </label>
                <label className='flex flex-col gap-1'>
                  <span className='text-[14px] font-medium text-[#444]'>프로필 이미지 URL</span>
                  <input
                    className='rounded-[8px] border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-[#222] focus:ring-2 focus:ring-[#1DB954] focus:outline-none'
                    value={editProfile.avatar}
                    onChange={e => setEditProfile({ ...editProfile, avatar: e.target.value })}
                  />
                </label>
              </div>
              <div className='mt-8 flex gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 rounded-[8px] border border-[#E5E5E5] bg-white py-2 text-[14px] font-medium text-[#444] shadow-none hover:bg-[#F5F5F5]'
                  onClick={handleEditClose}
                >
                  취소
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 rounded-[8px] border border-[#E5E5E5] bg-[#1DB954] py-2 text-[14px] font-medium text-white shadow-none hover:bg-[#1DB954]/90'
                  onClick={handleEditSave}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Success Toast */}
        {editSuccess && (
          <div className='animate-slideIn fixed top-8 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-green-500 px-6 py-3 text-white shadow-lg'>
            프로필이 저장되었습니다.
          </div>
        )}
        {/* 탭 */}
        <div className='mb-4 flex gap-2'>
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'posts' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}
            onClick={() => setActiveTab('posts')}
          >
            포스트
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'liked' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}
            onClick={() => setActiveTab('liked')}
          >
            좋아요한 포스트
          </button>
        </div>
        {/* Posts Content */}
        <div className='mx-auto w-full max-w-4xl flex-1 pb-[110px]'>
          <div className='flex flex-col gap-2'>
            {(activeTab === 'posts' ? myPosts : likedPosts).map(post => (
              <PostCard
                key={post.id}
                post={post}
                showAuthor={activeTab === 'liked'}
                isDarkMode={false}
                setSpotifyModalUri={setSpotifyModalUri}
              />
            ))}
            {/* Empty State */}
            {((activeTab === 'posts' && myPosts.length === 0) ||
              (activeTab === 'liked' && likedPosts.length === 0)) && (
              <div className='flex flex-col items-center justify-center py-16'>
                <i className='fas fa-music mb-4 text-5xl text-[#CCC]'></i>
                <h3 className='mb-2 text-[16px] font-medium text-[#888]'>
                  {activeTab === 'posts'
                    ? '아직 포스트가 없습니다'
                    : '아직 좋아요한 포스트가 없습니다'}
                </h3>
                <p className='text-[14px] text-[#BBB]'>
                  {activeTab === 'posts'
                    ? '첫 번째 플레이리스트를 만들어보세요!'
                    : '마음에 드는 포스트에 좋아요를 눌러보세요!'}
                </p>
              </div>
            )}
          </div>
        </div>
        <SpotifyPlayerModal uri={spotifyModalUri} onClose={() => setSpotifyModalUri(null)} />
      </div>
    </div>
  );
};

export default ProfilePage;
