import React from 'react';
import {
  useAuthStatus,
  useCurrentUserInfo,
  useTrends,
  useSearchPosts,
  useCreatePost,
  usePostDetail,
  useComments,
  useCreateComment,
} from '@/queries';
import type { PostCreateRequest } from '@/types/api';

// TanStack Query 사용 예시 컴포넌트
export const QueryUsageExample: React.FC = () => {
  // 1. 인증 상태 조회 (자동 캐싱, 중복 요청 방지)
  const { data: authData, isLoading: authLoading, error: authError } = useAuthStatus();

  // 2. 현재 사용자 정보 조회
  const { data: userData, isLoading: userLoading } = useCurrentUserInfo();

  // 3. 트렌드 조회 (5분간 캐시)
  const { data: trends, isLoading: trendsLoading } = useTrends(10);

  // 4. 게시글 검색 (검색어가 있을 때만 실행)
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: searchResults, isLoading: searchLoading } = useSearchPosts(searchQuery);

  // 5. 게시글 상세 조회
  const [selectedPostId, setSelectedPostId] = React.useState<number | null>(null);
  const { data: postDetail, isLoading: postLoading } = usePostDetail(selectedPostId!);

  // 6. 댓글 조회
  const { data: comments, isLoading: commentsLoading } = useComments(selectedPostId!);

  // 7. 뮤테이션 훅들
  const createPostMutation = useCreatePost();
  const createCommentMutation = useCreateComment();

  // 게시글 생성 예시
  const handleCreatePost = () => {
    const newPost: PostCreateRequest = {
      tracks: [],
      content: '새로운 게시글입니다.',
      isPublic: true,
    };

    createPostMutation.mutate(newPost, {
      onSuccess: data => {
        console.log('게시글 생성 성공:', data);
        // 성공 시 자동으로 관련 쿼리들이 무효화되어 최신 데이터를 가져옵니다
      },
      onError: error => {
        console.error('게시글 생성 실패:', error);
      },
    });
  };

  // 댓글 생성 예시
  const handleCreateComment = () => {
    if (!selectedPostId) return;

    createCommentMutation.mutate(
      {
        data: {
          postId: selectedPostId,
          content: '새로운 댓글입니다.',
        },
        details: {
          enabled: true,
          id: userData?.data?.id || 0,
          password: '',
          authorities: [],
          username: userData?.data?.username || '',
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
      },
      {
        onSuccess: () => {
          console.log('댓글 생성 성공');
          // 성공 시 해당 게시글의 댓글 목록이 자동으로 갱신됩니다
        },
      }
    );
  };

  if (authLoading) return <div>인증 상태 확인 중...</div>;
  if (authError) return <div>인증 오류: {authError.message}</div>;

  return (
    <div className='space-y-4 p-4'>
      <h2 className='text-xl font-bold'>TanStack Query 사용 예시</h2>

      {/* 인증 상태 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>인증 상태</h3>
        <p>인증됨: {authData?.data?.authenticated ? '예' : '아니오'}</p>
        <p>사용자: {authData?.data?.name || '알 수 없음'}</p>
      </div>

      {/* 사용자 정보 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>사용자 정보</h3>
        {userLoading ? (
          <p>사용자 정보 로딩 중...</p>
        ) : (
          <p>사용자명: {userData?.data?.username || '알 수 없음'}</p>
        )}
      </div>

      {/* 트렌드 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>트렌드</h3>
        {trendsLoading ? (
          <p>트렌드 로딩 중...</p>
        ) : (
          <ul>
            {trends?.slice(0, 3).map((trend, index) => (
              <li key={index}>
                {trend.postContent} (점수: {trend.score})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 검색 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>게시글 검색</h3>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='검색어를 입력하세요'
          className='w-full rounded border p-2'
        />
        {searchLoading ? (
          <p>검색 중...</p>
        ) : (
          <p>검색 결과: {searchResults?.content?.length || 0}개</p>
        )}
      </div>

      {/* 게시글 생성 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>게시글 생성</h3>
        <button
          onClick={handleCreatePost}
          disabled={createPostMutation.isPending}
          className='rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
        >
          {createPostMutation.isPending ? '생성 중...' : '게시글 생성'}
        </button>
      </div>

      {/* 게시글 상세 */}
      <div className='rounded border p-4'>
        <h3 className='font-semibold'>게시글 상세</h3>
        <input
          type='number'
          value={selectedPostId || ''}
          onChange={e => setSelectedPostId(Number(e.target.value) || null)}
          placeholder='게시글 ID 입력'
          className='w-full rounded border p-2'
        />
        {postLoading ? (
          <p>게시글 로딩 중...</p>
        ) : (
          postDetail && (
            <div>
              <p>내용: {postDetail.data.content}</p>
              <p>작성자: {postDetail.data.userName}</p>
            </div>
          )
        )}
      </div>

      {/* 댓글 */}
      {selectedPostId && (
        <div className='rounded border p-4'>
          <h3 className='font-semibold'>댓글</h3>
          <button
            onClick={handleCreateComment}
            disabled={createCommentMutation.isPending}
            className='mb-2 rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50'
          >
            {createCommentMutation.isPending ? '댓글 작성 중...' : '댓글 작성'}
          </button>
          {commentsLoading ? (
            <p>댓글 로딩 중...</p>
          ) : (
            <ul>
              {comments?.data?.slice(0, 3).map(comment => (
                <li key={comment.id} className='border-b py-1'>
                  {comment.content} - {comment.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
