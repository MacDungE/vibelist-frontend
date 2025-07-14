import React, { useContext } from 'react';
import PostCard from '@/components/common/PostCard';

import { PostsContext } from '@/contexts/PostsContext';


const ExplorePage: React.FC = () => {
  const { posts, setPosts } = useContext(PostsContext);
  const isDarkMode = false;
  const [, setSpotifyModalUri] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  // 모든 태그 추출(중복 제거)
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));
  // 검색/태그 필터링
  const filteredPosts = posts.filter(post => {
    const matchTag = selectedTag ? post.tags.includes(selectedTag) : true;
    const matchSearch = search ? post.description.includes(search) || post.tags.some(tag => tag.includes(search)) : true;
    return matchTag && matchSearch;
  });

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  };


  const trendingPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);
  // 추천(피드) 포스트: 최신순 전체
  const recommendedPosts = [...posts].sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen w-full font-sans pb-20" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        {/* 트렌딩 포스트 */}
        <h2 className="text-xl font-bold mb-4 mt-6">트렌딩 포스트</h2>
        <div className="rounded-[16px] p-0 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--stroke)' }}>
          <ul>
            {trendingPosts.map((post, idx) => (
              <li
                key={post.id}
                className={`flex items-center px-5 py-4 cursor-pointer transition ${idx !== trendingPosts.length - 1 ? '' : ''}`}
                style={{ borderBottom: idx !== trendingPosts.length - 1 ? '1px solid var(--stroke)' : undefined, background: 'transparent' }}
              >
                <div className="flex-1 min-w-0 font-semibold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {post.description.length > 24 ? post.description.slice(0, 24) + '...' : post.description}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} className="text-xs rounded-full px-2 py-0.5" style={{ background: 'var(--surface-alt)', color: 'var(--primary)' }}>#{tag}</span>
                  ))}
                  <span className="flex items-center text-[13px] ml-2" style={{ color: 'var(--text-secondary)' }}>
                    <i className="fas fa-heart mr-1"></i>{post.likes}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* 검색 UI */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--stroke)', color: 'var(--text-primary)' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* 태그 리스트 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedTag === tag ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-50 text-indigo-700 border-indigo-100'} transition`}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
        {/* 피드/검색 결과 */}
        <div className="grid grid-cols-1 gap-3 mb-10">
          {search || selectedTag ? (
            filteredPosts.length === 0 ? (
              <div className="text-center text-gray-400 py-12">검색 결과가 없습니다.</div>
            ) : (
              filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isDarkMode={isDarkMode}
                  setSpotifyModalUri={setSpotifyModalUri}
                  showAuthor={true}
                  onLike={() => handleLike(post.id)}
                  onComment={() => {}}
                />
              ))
            )
          ) : (
            recommendedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isDarkMode={isDarkMode}
                setSpotifyModalUri={setSpotifyModalUri}
                showAuthor={true}
                onLike={() => handleLike(post.id)}
                onComment={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage; 