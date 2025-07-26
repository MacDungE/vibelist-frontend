// 쿼리 키 상수 정의
export const queryKeys = {
  // 인증 관련
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    login: () => [...queryKeys.auth.all, 'login'] as const,
    logout: () => [...queryKeys.auth.all, 'logout'] as const,
  },

  // 사용자 관련
  user: {
    all: ['users'] as const,
    profile: (userId?: string) => [...queryKeys.user.all, 'profile', userId] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },

  // 게시물 관련
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (postId: string) => [...queryKeys.posts.details(), postId] as const,
    comments: (postId: string) => [...queryKeys.posts.all, 'comments', postId] as const,
    likeStatus: (postId: string) => [...queryKeys.posts.detail(postId), 'likeStatus'] as const,
    likeCount: (postId: string) => [...queryKeys.posts.detail(postId), 'likeCount'] as const,
  },
  comments: {
    likeStatus: (commentId: string) => ['comment', commentId, 'likeStatus'] as const,
    likeCount: (commentId: string) => ['comment', commentId, 'likeCount'] as const,
  },

  // 감정 관련
  emotions: {
    all: ['emotions'] as const,
    chart: () => [...queryKeys.emotions.all, 'chart'] as const,
    stats: () => [...queryKeys.emotions.all, 'stats'] as const,
  },

  // 무드 관련
  moods: {
    all: ['moods'] as const,
    current: () => [...queryKeys.moods.all, 'current'] as const,
    history: () => [...queryKeys.moods.all, 'history'] as const,
  },

  // 플레이리스트 관련
  playlists: {
    all: ['playlists'] as const,
    recommendations: () => [...queryKeys.playlists.all, 'recommendations'] as const,
    userPlaylists: () => [...queryKeys.playlists.all, 'user'] as const,
  },

  // 탐색 관련
  explore: {
    all: ['explore'] as const,
    trending: () => [...queryKeys.explore.all, 'trending'] as const,
    search: (query: string) => [...queryKeys.explore.all, 'search', query] as const,
  },

  // 시스템 관련
  system: {
    all: ['system'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
} as const;
