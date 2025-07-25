# TanStack Query 사용 가이드

이 프로젝트에서는 중복 통신을 방지하고 효율적인 데이터 관리를 위해 TanStack Query를 사용합니다.

## 📁 폴더 구조

```
src/queries/
├── index.ts                    # 모든 쿼리 훅 export
├── queryKeys.ts               # 쿼리 키 상수 정의
├── useAuthQueries.ts          # 인증 관련 쿼리
├── usePostQueries.ts          # 게시물 관련 쿼리
├── useCommentQueries.ts       # 댓글 관련 쿼리
├── useUserQueries.ts          # 사용자 관련 쿼리
├── useEmotionQueries.ts       # 감정 관련 쿼리
├── usePlaylistQueries.ts      # 플레이리스트 관련 쿼리
├── useRecommendQueries.ts     # 추천 관련 쿼리
├── useExploreQueries.ts       # 탐색 관련 쿼리
├── useSystemQueries.ts        # 시스템 관련 쿼리
└── useIntegrationQueries.ts   # 통합 관련 쿼리
```

## 🚀 기본 사용법

### 1. 쿼리 훅 사용 (데이터 조회)

```tsx
import { useAuthStatus, useCurrentUserInfo } from '@/queries';

function MyComponent() {
  // 인증 상태 조회
  const { data: authData, isLoading, error } = useAuthStatus();

  // 사용자 정보 조회
  const { data: userData } = useCurrentUserInfo();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div>
      <p>인증됨: {authData?.data?.authenticated ? '예' : '아니오'}</p>
      <p>사용자: {userData?.data?.username}</p>
    </div>
  );
}
```

### 2. 뮤테이션 훅 사용 (데이터 변경)

```tsx
import { useCreatePost, useUpdatePost } from '@/queries';

function PostForm() {
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  const handleCreate = () => {
    createPostMutation.mutate(
      {
        tracks: [],
        content: '새 게시글',
        isPublic: true,
      },
      {
        onSuccess: data => {
          console.log('게시글 생성 성공:', data);
          // 성공 시 자동으로 관련 쿼리들이 무효화됩니다
        },
        onError: error => {
          console.error('게시글 생성 실패:', error);
        },
      }
    );
  };

  return (
    <button onClick={handleCreate} disabled={createPostMutation.isPending}>
      {createPostMutation.isPending ? '생성 중...' : '게시글 생성'}
    </button>
  );
}
```

## 🔑 쿼리 키 관리

모든 쿼리 키는 `queryKeys.ts`에서 중앙 관리됩니다.

```tsx
// 쿼리 키 사용 예시
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    detail: (postId: string) => [...queryKeys.posts.all, 'detail', postId] as const,
    comments: (postId: string) => [...queryKeys.posts.all, 'comments', postId] as const,
  },
};
```

## ⚙️ 설정 옵션

### 기본 설정 (QueryProvider에서 설정)

- **staleTime**: 5분 (5분 동안은 캐시된 데이터 사용)
- **gcTime**: 10분 (10분 후 메모리에서 제거)
- **retry**: 1회 (에러 시 1회 재시도)
- **refetchOnWindowFocus**: false (창 포커스 시 자동 갱신 비활성화)

### 개별 쿼리 설정

```tsx
const { data } = useQuery({
  queryKey: queryKeys.posts.detail(postId),
  queryFn: () => getPostDetail(postId),
  staleTime: 2 * 60 * 1000, // 2분
  enabled: !!postId, // postId가 있을 때만 실행
});
```

## 🎯 주요 기능

### 1. 자동 캐싱

- 동일한 쿼리는 자동으로 캐시되어 중복 요청을 방지합니다.
- 설정된 시간 동안 캐시된 데이터를 사용합니다.

### 2. 자동 무효화

- 뮤테이션 성공 시 관련 쿼리들이 자동으로 무효화됩니다.
- 최신 데이터를 자동으로 가져옵니다.

### 3. 로딩/에러 상태 관리

- `isLoading`, `isPending`, `error` 상태를 자동으로 관리합니다.
- UI에서 로딩 상태와 에러 처리를 쉽게 구현할 수 있습니다.

### 4. 조건부 실행

- `enabled` 옵션으로 조건부 쿼리 실행이 가능합니다.
- 필요한 데이터가 있을 때만 API를 호출합니다.

## 📝 사용 예시

### 게시글 목록과 상세 조회

```tsx
import { useFeed, usePostDetail, useComments } from '@/queries';

function PostList() {
  // 게시글 목록 조회
  const { data: posts, isLoading } = useFeed();
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // 선택된 게시글 상세 조회
  const { data: postDetail } = usePostDetail(selectedPostId!);

  // 선택된 게시글의 댓글 조회
  const { data: comments } = useComments(selectedPostId!);

  return (
    <div>
      {posts?.content?.map(post => (
        <div key={post.id} onClick={() => setSelectedPostId(post.id)}>
          {post.content}
        </div>
      ))}

      {selectedPostId && postDetail && (
        <div>
          <h3>{postDetail.data.content}</h3>
          <p>댓글 수: {comments?.data?.length || 0}</p>
        </div>
      )}
    </div>
  );
}
```

### 검색 기능

```tsx
import { useSearchPosts } from '@/queries';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data: searchResults, isLoading } = useSearchPosts(query);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder='검색어 입력' />

      {isLoading ? (
        <p>검색 중...</p>
      ) : (
        <ul>
          {searchResults?.content?.map(post => (
            <li key={post.id}>{post.content}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🔧 개발 도구

개발 환경에서는 React Query Devtools가 자동으로 활성화됩니다.
브라우저에서 쿼리 상태와 캐시를 실시간으로 확인할 수 있습니다.

## 📚 추가 리소스

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools)
- [쿼리 키 관리 가이드](https://tanstack.com/query/latest/docs/react/guides/query-keys)
