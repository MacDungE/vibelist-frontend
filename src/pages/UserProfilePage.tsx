import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import type { Post } from '@/components/common/PostCard';

// Mock user data
const mockUsers = [
  {
    username: '음악러버',
    name: '음악러버',
    bio: '감정에 따라 음악을 추천받고 나만의 플레이리스트를 만들어가는 중입니다. 다양한 장르의 음악을 사랑하며, 특히 새벽 감성과 재즈를 좋아해요.',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20young%20person%20with%20friendly%20smile%2C%20soft%20purple%20lighting%20background%2C%20modern%20aesthetic%20profile%20picture%20style&width=128&height=128&seq=avatar&orientation=squarish',
  },
  {
    username: '재즈러버',
    name: '재즈러버',
    bio: '재즈와 감성 음악을 사랑하는 사람입니다.',
    avatar: '',
  },
  {
    username: '운동러버',
    name: '운동러버',
    bio: '운동할 때 듣는 음악을 공유해요!',
    avatar: '',
  },
  {
    username: '추억여행자',
    name: '추억여행자',
    bio: '추억의 음악을 찾아 떠나는 여행자.',
    avatar: '',
  },
];

// Mock posts
const allPosts: Post[] = [
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
    author: '음악러버',
    authorAvatar: '',
    emotion: '무기력한 상태',
    mood: '반대 기분',
  },
  {
    id: 2,
    description: '운동할 때 듣는 신나는 음악',
    likes: 256,
    comments: 32,
    isPrivate: false,
    createdAt: '5일 전',
    tags: ['Workout', 'Energy', 'Pop'],
    trackCount: 10,
    duration: '38분',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP',
    playlist: [
      { id: 1, artist: 'Kanye West', duration: '5:12' },
      { id: 2, artist: 'David Guetta', duration: '4:05' },
    ],
    author: '운동러버',
    authorAvatar: '',
    emotion: '활기찬 상태',
    mood: '기분 올리기',
  },
  {
    id: 3,
    description: '비 오는 날의 재즈',
    likes: 189,
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
    author: '재즈러버',
    authorAvatar: '',
    emotion: '차분한 상태',
    mood: '기분 유지하기',
  },
  {
    id: 4,
    description: '숲속의 새소리와 함께하는 명상 음악',
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

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const user = mockUsers.find(u => u.username === username);
  const userPosts = allPosts.filter(post => post.author === username);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h2 className="text-2xl font-bold mb-4">존재하지 않는 유저입니다.</h2>
        <button className="px-4 py-2 rounded bg-indigo-500 text-white" onClick={() => navigate(-1)}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] font-sans">
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        {/* Profile Card */}
        <section className="w-full mx-auto mb-8">
          <div className="flex items-center gap-8 px-8 py-4 rounded-xl bg-[var(--surface)] border border-[var(--stroke)]">
            <img
              src={user.avatar || 'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=128&height=128&seq=avatar1&orientation=squarish'}
              alt="프로필"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-[var(--text-primary)] truncate">{user.name}</span>
                <span className="text-xs text-[var(--text-secondary)] truncate">@{user.username}</span>
              </div>
              {/* 소개글: 왼쪽 정렬, 전체 표시 */}
              <div className="text-xs text-[var(--text-secondary)] text-left whitespace-pre-line">
                {user.bio}
              </div>
              {/* 받은 좋아요(하트)만 표시 */}
              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-3">
                <span><i className="fas fa-heart text-pink-400 mr-1"></i>받은 좋아요 <b>{userPosts.reduce((acc, p) => acc + (p.likes || 0), 0)}</b></span>
              </div>
            </div>
          </div>
        </section>
        {/* 유저의 포스트 */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">포스트</h3>
          <div className="grid grid-cols-1 gap-3">
            {userPosts.length === 0 ? (
              <div className="text-center text-gray-400 py-12">아직 포스트가 없습니다.</div>
            ) : (
              userPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  showAuthor={true}
                  isDarkMode={false}
                  setSpotifyModalUri={() => {}}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage; 