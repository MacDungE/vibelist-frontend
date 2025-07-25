import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import { getTrends, searchPosts, getFeed } from '@/http/exploreApi';
import type { TrendResponse, PostDetailResponse } from '@/types/api';
import { useFeed, useSearchPosts } from '@/queries/useExploreQueries';

const PAGE_SIZE = 10;

const ExplorePage: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.scrollY !== undefined) {
      window.scrollTo(0, location.state.scrollY);
    }
  }, [location.state]);
  const navigate = useNavigate();
  // 트렌드 기존대로
  const [trendList, setTrendList] = useState<TrendResponse[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  // 검색어
  const [search, setSearch] = useState('');

  // 무한스크롤 상태
  const [feedPage, setFeedPage] = useState(0);
  const [feedList, setFeedList] = useState<PostDetailResponse[]>([]);
  const [feedLast, setFeedLast] = useState(false);

  const [searchPage, setSearchPage] = useState(0);
  const [searchList, setSearchList] = useState<PostDetailResponse[]>([]);
  const [searchLast, setSearchLast] = useState(false);

  // 쿼리 훅
  const {
    data: feedData,
    isLoading: feedLoading,
    isError: feedError,
    isFetching: feedFetching,
  } = useFeed(feedPage, PAGE_SIZE);

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
    isFetching: searchFetching,
  } = useSearchPosts(search, searchPage, PAGE_SIZE);

  // 트렌드 기존대로
  useEffect(() => {
    setTrendLoading(true);
    setTrendError(null);
    getTrends(10)
      .then(res => {
        // rank 오름차순 정렬
        const sorted = Array.isArray(res) ? [...res].sort((a, b) => a.rank - b.rank) : [];
        setTrendList(sorted);
        setTrendLoading(false);
      })
      .catch(() => {
        setTrendError('트렌드 정보를 불러오지 못했습니다.');
        setTrendLoading(false);
      });
  }, []);

  // feed 데이터 append (content가 배열일 때만)
  useEffect(() => {
    console.log('feedData:', feedData);
    if (feedData && Array.isArray(feedData.data?.content)) {
      setFeedList(prev =>
        feedPage === 0 ? feedData.data.content : [...prev, ...feedData.data.content]
      );
      setFeedLast(feedData.data.last);
    } else if (feedData && feedPage === 0) {
      setFeedList([]);
      setFeedLast(true);
    }
  }, [feedData, feedPage]);

  // search 데이터 append (content가 배열일 때만)
  useEffect(() => {
    if (search && searchData && Array.isArray(searchData.content)) {
      setSearchList(prev =>
        searchPage === 0 ? searchData.content : [...prev, ...searchData.content]
      );
      setSearchLast(searchData.last);
    } else if (search && searchData && searchPage === 0) {
      setSearchList([]);
      setSearchLast(true);
    }
  }, [searchData, searchPage, search]);

  // 검색어 변경 시 검색 페이지/리스트 초기화
  useEffect(() => {
    setSearchPage(0);
    setSearchList([]);
    setSearchLast(false);
  }, [search]);

  // 무한스크롤 IntersectionObserver
  const loaderRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (search) {
            if (
              !searchLast &&
              !searchFetching &&
              !(searchPage === 0 && searchLoading) // 첫 페이지 로딩 중이면 skip
            ) {
              setSearchPage(p => p + 1);
            }
          } else {
            if (
              !feedLast &&
              !feedFetching &&
              !(feedPage === 0 && feedLoading) // 첫 페이지 로딩 중이면 skip
            ) {
              setFeedPage(p => p + 1);
            }
          }
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [
    search,
    searchLast,
    searchLoading,
    searchFetching,
    searchPage,
    feedLast,
    feedLoading,
    feedFetching,
    feedPage,
  ]);

  // 트렌드 상태 아이콘/텍스트 기존대로
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

  // PostDetailResponse -> PostCard의 Post 타입 변환 함수 (방어적)
  const toPostCardData = (post: PostDetailResponse) => ({
    id: post.id,
    description: post.content ?? '',
    likes: post.likeCnt ?? 0,
    comments: 0, // 댓글 수 별도 API 필요
    isPrivate: !post.isPublic,
    createdAt: post.createdAt ?? '',
    tags: Array.isArray((post as any).tags) ? (post as any).tags : [],
    playlist: {
      tracks: Array.isArray(post.playlist?.tracks)
        ? post.playlist.tracks.map((track, idx) => ({
            id: track.trackId || idx + 1,
            artist: track.artist ?? '',
            duration:
              typeof track.durationMs === 'number'
                ? `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}`
                : '0:00',
            cover: track.imageUrl ?? '',
            title: track.title ?? '',
            album: track.album ?? '',
          }))
        : [],
      totalTracks:
        typeof post.playlist?.totalTracks === 'number' ? post.playlist.totalTracks : undefined,
      totalLengthSec:
        typeof post.playlist?.totalLengthSec === 'number'
          ? post.playlist.totalLengthSec
          : undefined,
      spotifyUrl: post.playlist?.spotifyUrl ?? '',
    },
    user: {
      name: post.name || post.userProfileName || post.userName || '',
      username: post.username || post.userName || '',
      avatar: post.avatarUrl || post.userProfileImage || '',
    },
  });

  // 디버깅용 콘솔 출력
  console.log('feedList:', feedList);
  console.log('feedData.data.content:', feedData?.data?.content);

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
              {(Array.isArray(trendList) ? trendList.slice(0, 5) : []).map((trend, idx) => (
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
            searchList.length === 0 && searchLoading ? (
              <div className='py-12 text-center text-gray-400'>검색중...</div>
            ) : searchError ? (
              <div className='py-12 text-center text-red-400'>검색 결과를 불러오지 못했습니다.</div>
            ) : searchList.length === 0 ? (
              <div className='py-12 text-center text-gray-400'>검색 결과가 없습니다.</div>
            ) : (
              searchList.map(post => (
                <PostCard key={post.id} post={toPostCardData(post)} showAuthor={true} />
              ))
            )
          ) : feedList.length === 0 &&
            Array.isArray(feedData?.data?.content) &&
            feedData.data.content.length > 0 ? (
            // feedList가 비어있고 feedData.data.content가 배열이면 강제로 PostCard 렌더링
            feedData.data.content.map(post => (
              <PostCard key={post.id} post={toPostCardData(post)} showAuthor={true} />
            ))
          ) : feedList.length === 0 && feedLoading ? (
            <div className='py-12 text-center text-gray-400'>피드 로딩중...</div>
          ) : feedError ? (
            <div className='py-12 text-center text-red-400'>피드 정보를 불러오지 못했습니다.</div>
          ) : feedList.length === 0 ? (
            <div className='py-12 text-center text-gray-400'>피드가 없습니다.</div>
          ) : (
            feedList.map(post => (
              <PostCard key={post.id} post={toPostCardData(post)} showAuthor={true} />
            ))
          )}
          {/* 무한스크롤 로더 */}
          <div ref={loaderRef} style={{ height: 32 }} />
          {(search ? searchFetching : feedFetching) && (
            <div className='py-4 text-center text-gray-400'>불러오는 중...</div>
          )}
          {(search ? searchLast : feedLast) &&
            (search ? searchList.length > 0 : feedList.length > 0) && (
              <div className='py-4 text-center text-gray-400'>마지막 페이지입니다.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
