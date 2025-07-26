import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotifyPlayerModal from '@/components/common/SpotifyPlayerModal';
import PostCard from '@/components/common/PostCard';
import { DEFAULT_AVATAR_URL, SAMPLE_POST_IMAGES } from '@/constants/images';

import { Button } from '@/components/ui/button';

// Mock data for posts and liked posts

const initialProfile = {
  name: '음악러버',
  username: '@musiclover2024',
  bio: '감정에 따라 음악을 추천받고 나만의 플레이리스트를 만들어가는 중입니다. 다양한 장르의 음악을 사랑하며, 특히 새벽 감성과 재즈를 좋아해요.',
  avatar: DEFAULT_AVATAR_URL,
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
        <div className='mx-auto w-full max-w-4xl flex-1 pb-[110px]'></div>
        <SpotifyPlayerModal uri={spotifyModalUri} onClose={() => setSpotifyModalUri(null)} />
      </div>
    </div>
  );
};

export default ProfilePage;
