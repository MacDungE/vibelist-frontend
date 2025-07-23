import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import { getTrends, searchPosts, getFeed } from '@/http/exploreApi';
import type { TrendResponse, PostDetailResponse } from '@/types/api';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [trendList, setTrendList] = useState<TrendResponse[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PostDetailResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [feed, setFeed] = useState<PostDetailResponse[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // 트렌드 조회
  useEffect(() => {
    setTrendLoading(true);
    setTrendError(null);
    getTrends(10)
      .then(res => {
        setTrendList(res);
        setTrendLoading(false);
      })
      .catch(() => {
        setTrendError('트렌드 정보를 불러오지 못했습니다.');
        setTrendLoading(false);
      });
  }, []);

  // 피드 조회
  useEffect(() => {
    setFeedLoading(true);
    setFeedError(null);
    getFeed()
      .then(res => {
        setFeed(res.content);
        setFeedLoading(false);
      })
      .catch(() => {
        setFeedError('피드 정보를 불러오지 못했습니다.');
        setFeedLoading(false);
      });
  }, []);

  // 검색
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    const timeout = setTimeout(() => {
      searchPosts(search)
        .then(res => {
          setSearchResults(res.content);
          setSearchLoading(false);
        })
        .catch(() => {
          setSearchError('검색 결과를 불러오지 못했습니다.');
          setSearchLoading(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // 트렌드 상태 아이콘/텍스트
  const getTrendStatus = (status: string) => {
    switch (status) {
      case 'UP':
        return <span className='font-bold text-green-600'>▲</span>;
      case 'DOWN':
        return <span className='font-bold text-red-500'>▼</span>;
      case 'NEW':
        return <span className='font-bold text-blue-500'>NEW</span>;
      case 'SAME':
        return <span className='font-bold text-gray-400'>-</span>;
      case 'OUT':
        return <span className='font-bold text-gray-300'>X</span>;
      default:
        return status;
    }
  };

  return (
    <div
      className='min-h-screen w-full pb-20 font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        {/* 트렌드 피드 */}
        <h2 className='mt-6 mb-4 text-xl font-bold'>트렌드 피드</h2>
        <div
          className='mb-8 rounded-[16px] p-0'
          style={{ background: 'var(--surface)', border: '1px solid var(--stroke)' }}
        >
          {trendLoading ? (
            <div className='py-8 text-center text-gray-400'>트렌드 로딩중...</div>
          ) : trendError ? (
            <div className='py-8 text-center text-red-400'>{trendError}</div>
          ) : Array.isArray(trendList) && trendList.length === 0 ? (
            <div className='py-8 text-center text-gray-400'>트렌드 피드가 없습니다.</div>
          ) : (
            <ul>
              {(Array.isArray(trendList) ? trendList : []).map((trend, idx) => (
                <li
                  key={trend.postId}
                  className={`flex cursor-pointer items-center px-5 py-4 transition ${idx !== (trendList?.length ?? 0) - 1 ? '' : ''}`}
                  style={{
                    borderBottom:
                      idx !== (trendList?.length ?? 0) - 1 ? '1px solid var(--stroke)' : undefined,
                    background: 'transparent',
                  }}
                  onClick={() => navigate(`/post/${trend.postId}`)}
                >
                  <div className='w-8 flex-shrink-0 text-center text-lg font-bold'>
                    {trend.rank}
                  </div>
                  <div
                    className='min-w-0 flex-1 truncate text-[15px] font-semibold'
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {trend.postContent && trend.postContent.length > 24
                      ? trend.postContent.slice(0, 24) + '...'
                      : trend.postContent}
                  </div>
                  <div className='ml-4 flex flex-shrink-0 items-center gap-2'>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700'>
                      {trend.userName}
                    </span>
                    {getTrendStatus(trend.trendStatus)}
                    {trend.rankChange !== 0 && (
                      <span className='ml-1 text-xs text-gray-500'>
                        {trend.rankChange > 0 ? `+${trend.rankChange}` : trend.rankChange}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* 검색 UI */}
        <div className='mb-6'>
          <input
            type='text'
            placeholder='검색어를 입력하세요'
            className='w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none'
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--stroke)',
              color: 'var(--text-primary)',
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* 피드/검색 결과 */}
        <div className='mb-10 grid grid-cols-1 gap-3'>
          {search ? (
            searchLoading ? (
              <div className='py-12 text-center text-gray-400'>검색중...</div>
            ) : searchError ? (
              <div className='py-12 text-center text-red-400'>{searchError}</div>
            ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
              <div className='py-12 text-center text-gray-400'>검색 결과가 없습니다.</div>
            ) : (
              (searchResults || []).map(post => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    description: post.content,
                    likes: post.likeCnt,
                    comments: 0,
                    isPrivate: !post.isPublic,
                    createdAt: post.createdAt,
                    tags: post.tags || [],
                    playlist:
                      post.playlist?.tracks?.map((track, idx) => ({
                        id: idx + 1,
                        artist: track.artist,
                        duration: `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}`,
                        cover: track.imageUrl,
                        title: track.title,
                        spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
                      })) || [],
                    author: post.userName || post.userProfileName,
                    authorAvatar: '',
                  }}
                  showAuthor={true}
                />
              ))
            )
          ) : feedLoading ? (
            <div className='py-12 text-center text-gray-400'>피드 로딩중...</div>
          ) : feedError ? (
            <div className='py-12 text-center text-red-400'>{feedError}</div>
          ) : !Array.isArray(feed) || feed.length === 0 ? (
            <div className='py-12 text-center text-gray-400'>피드가 없습니다.</div>
          ) : (
            (feed || []).map(post => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  description: post.content,
                  likes: post.likeCnt,
                  comments: 0,
                  isPrivate: !post.isPublic,
                  createdAt: post.createdAt,
                  tags: post.tags || [],
                  playlist:
                    post.playlist?.tracks?.map((track, idx) => ({
                      id: idx + 1,
                      artist: track.artist,
                      duration: `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}`,
                      cover: track.imageUrl,
                      title: track.title,
                      spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
                    })) || [],
                  author: post.userName || post.userProfileName,
                  authorAvatar: '',
                }}
                showAuthor={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
