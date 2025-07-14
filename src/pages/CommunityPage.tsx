import React, { useState } from 'react';
import PostCard from '@/components/common/PostCard';
import type { Post } from '@/components/common/PostCard';


// Mock public posts data
const allPosts: Post[] = [
  {
    id: 1,
    description: '새벽 감성 플레이리스트',
    likes: 124,
    comments: 18,
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
  // ... add more posts as needed
];

// Trending: top 2 by likes (for demo)
const trendingPosts = allPosts.slice().sort((a, b) => b.likes - a.likes).slice(0, 2);

const CommunityPage: React.FC = () => {
  const [posts] = useState<Post[]>(allPosts);
  const [, setSpotifyModalUri] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] font-sans">
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">커뮤니티</h1>
        {/* 트렌드 섹션 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">트렌드 게시글</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trendingPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isDarkMode={false}
                setSpotifyModalUri={setSpotifyModalUri}
                showAuthor={true}
                onLike={() => {}}
                onComment={() => {}}
                // Open detail modal on card click
                // For demo, open on description click
                // You can wrap the whole card in a button/div for full-card click
                // Here, add onClick to the card div
                // But PostCard does not expose onClick, so wrap in a div:
                // (see below)
              />
            ))}
          </div>
        </section>
        {/* 전체 공개 포스트 리스트 */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">최신 공개 포스트</h2>
          <div className="grid grid-cols-1 gap-3">
            {posts.map(post => (
              <div key={post.id} className="cursor-pointer">
                <PostCard
                  post={post}
                  isDarkMode={false}
                  setSpotifyModalUri={setSpotifyModalUri}
                  showAuthor={true}
                  onLike={() => {}}
                  onComment={() => {}}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityPage; 