import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '@/components/common/PostCard';
import type { PagePostDetailResponse, PostDetailResponse } from '@/types/api';
import { useFeed, useSearchPosts, useTrends } from '@/queries/useExploreQueries';
import DocumentTitle from '@/components/seo/DocumentTitle.tsx';

const PAGE_SIZE = 10;

/*export const toPostCardData = (post: PostDetailResponse) => ({
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
      typeof post.playlist?.totalLengthSec === 'number' ? post.playlist.totalLengthSec : undefined,
    spotifyUrl: post.playlist?.spotifyUrl ?? '',
  },
  user: {
    name: post?.name || post.userProfileName || post.userName || '',
    username: post?.username || post.userName || '',
    avatar: post?.avatarUrl || post?.userProfileImage || '',
  },
});*/

const ExplorePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 스크롤 위치 복원
  useEffect(() => {
    if (location.state?.scrollY !== undefined) {
      window.scrollTo(0, location.state.scrollY);
    }
  }, [location.state]);

  // 검색어 상태
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const prevDebouncedSearchRef = useRef('');

  // 무한스크롤 상태
  const [feedPage, setFeedPage] = useState(0);
  const [feedItems, setFeedItems] = useState<PostDetailResponse[]>([]);
  const [feedIsLast, setFeedIsLast] = useState(false);

  const [searchPage, setSearchPage] = useState(0);
  const [searchItems, setSearchItems] = useState<PostDetailResponse[]>([]);
  const [searchIsLast, setSearchIsLast] = useState(false);

  // 현재 활성화된 모드
  const isSearchMode = !!debouncedSearch;

  // 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // React Query 훅들
  const { data: trendData, isLoading: trendLoading, isError: trendError } = useTrends(10);

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
  } = useSearchPosts(debouncedSearch, searchPage, PAGE_SIZE);

  // 트렌드 데이터 정렬
  const sortedTrends = useMemo(() => {
    if (!Array.isArray(trendData)) return [];
    return [...trendData].sort((a, b) => a.rank - b.rank);
  }, [trendData]);

  // 피드 데이터 처리
  useEffect(() => {
    if (!feedData) return;

    // feedData는 PagePostDetailResponse 타입
    const feedPageInfo: PagePostDetailResponse = feedData.data;
    if (Array.isArray(feedPageInfo.content)) {
      setFeedItems(prev =>
        feedPage === 0 ? feedPageInfo.content : [...prev, ...feedPageInfo.content]
      );
      setFeedIsLast(feedPageInfo.last);
    }
  }, [feedData, feedPage]);

  // 검색 데이터 처리
  useEffect(() => {
    if (!debouncedSearch || !searchData) return;

    // searchData는 PagePostDetailResponse 타입
    const pageData: PagePostDetailResponse = searchData.data;
    if (Array.isArray(pageData.content)) {
      setSearchItems(prev =>
        searchPage === 0 ? pageData.content : [...prev, ...pageData.content]
      );
      setSearchIsLast(pageData.last);
    }
  }, [searchData, searchPage, debouncedSearch]);

  // 검색어 변경 시 검색 리스트 초기화
  useEffect(() => {
    if (debouncedSearch !== prevDebouncedSearchRef.current) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setSearchPage(0);
      setSearchItems([]);
      setSearchIsLast(false);
    }
  }, [debouncedSearch]);

  // 무한스크롤 처리
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        if (isSearchMode) {
          const isFirstPageLoading = searchPage === 0 && searchLoading;
          if (!searchIsLast && !searchFetching && !isFirstPageLoading) {
            setSearchPage(prev => prev + 1);
          }
        } else {
          const isFirstPageLoading = feedPage === 0 && feedLoading;
          if (!feedIsLast && !feedFetching && !isFirstPageLoading && feedItems.length > 0) {
            setFeedPage(prev => prev + 1);
          }
        }
      }
    },
    [
      isSearchMode,
      searchPage,
      searchLoading,
      searchIsLast,
      searchFetching,
      feedPage,
      feedLoading,
      feedIsLast,
      feedFetching,
      feedItems.length,
    ]
  );

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, { threshold: 1 });
    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [handleIntersection]);

  // 트렌드 상태 렌더링
  const renderTrendStatus = useCallback((status: string) => {
    const statusConfig = {
      UP: { icon: '▲', className: 'font-bold text-green-600' },
      DOWN: { icon: '▼', className: 'font-bold text-red-500' },
      NEW: { icon: 'NEW', className: 'font-bold text-blue-500' },
      SAME: { icon: '-', className: 'font-bold text-gray-400' },
      OUT: { icon: 'X', className: 'font-bold text-gray-300' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <span className={config.className}>{config.icon}</span> : <span>{status}</span>;
  }, []);

  // 렌더링 상태 계산
  const renderState = useMemo(() => {
    if (isSearchMode) {
      if (searchItems.length === 0 && searchLoading) return 'loading';
      if (searchError) return 'error';
      if (searchItems.length === 0) return 'empty';
      return 'data';
    }

    if (feedItems.length === 0 && feedLoading) return 'loading';
    if (feedError) return 'error';
    if (feedItems.length === 0) return 'empty';
    return 'data';
  }, [
    isSearchMode,
    searchItems.length,
    searchLoading,
    searchError,
    feedItems.length,
    feedLoading,
    feedError,
  ]);

  return (
    <div
      className='min-h-screen w-full pb-20 font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <DocumentTitle title={'탐색'} />
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
            <div className='py-8 text-center text-red-400'>트렌드 정보를 불러오지 못했습니다.</div>
          ) : sortedTrends.length === 0 ? (
            <div className='py-8 text-center text-gray-400'>트렌드 피드가 없습니다.</div>
          ) : (
            <ul>
              {sortedTrends.slice(0, 5).map((trend, idx) => (
                <li
                  key={trend.postId}
                  className='flex cursor-pointer items-center px-5 py-4 transition'
                  style={{
                    borderBottom:
                      idx !== sortedTrends.length - 1 ? '1px solid var(--stroke)' : undefined,
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
                    {trend.postContent?.length > 24
                      ? `${trend.postContent.slice(0, 24)}...`
                      : trend.postContent}
                  </div>
                  <div className='ml-4 flex flex-shrink-0 items-center gap-2'>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700'>
                      {trend.userName}
                    </span>
                    {renderTrendStatus(trend.trendStatus)}
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
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        {/* 피드/검색 결과 */}
        <div className='mb-10 grid grid-cols-1 gap-3'>
          {renderState === 'loading' && (
            <div className='py-12 text-center text-gray-400'>
              {isSearchMode ? '검색중...' : '피드 로딩중...'}
            </div>
          )}

          {renderState === 'error' && (
            <div className='py-12 text-center text-red-400'>
              {isSearchMode
                ? '검색 결과를 불러오지 못했습니다.'
                : '피드 정보를 불러오지 못했습니다.'}
            </div>
          )}

          {renderState === 'empty' && (
            <div className='py-12 text-center text-gray-400'>
              {isSearchMode ? '검색 결과가 없습니다.' : '피드가 없습니다.'}
            </div>
          )}

          {renderState === 'data' &&
            (isSearchMode ? searchItems : feedItems).map(post => (
              <PostCard key={post.id} post={post} showAuthor={true} />
            ))}

          {/* 무한스크롤 로더 */}
          {!(
            (isSearchMode ? searchIsLast : feedIsLast) ||
            (isSearchMode ? searchItems.length === 0 : feedItems.length === 0)
          ) && <div ref={loaderRef} style={{ height: 32, marginTop: 16 }} />}

          {(isSearchMode ? searchFetching : feedFetching) && (
            <div className='py-4 text-center text-gray-400'>불러오는 중...</div>
          )}

          {(isSearchMode ? searchIsLast : feedIsLast) &&
            (isSearchMode ? searchItems.length > 0 : feedItems.length > 0) && (
              <div className='py-4 text-center text-gray-400'>마지막 페이지입니다.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
