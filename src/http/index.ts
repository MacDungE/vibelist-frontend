// axios client
export { default as apiClient } from './client';

// 인증 관련
export * from './authApi';

// 사용자 관리
export * from './userApi';

// 게시글/플레이리스트
export * from './postApi';

// 댓글 관리
export * from './commentApi';

// 추천
export * from './recommendApi';

// Spotify 플레이리스트
export * from './playlistApi';

// 외부 서비스 연동
export * from './integrationApi';

// 시스템 상태
export * from './systemApi';

// Explore (검색, 트렌드, 피드)
export * from './exploreApi';

// 좋아요 관리
export * from './likeApi';

// 태그 관리
export * from './tagApi';

// 기존 API들 (API 문서에 없는 엔드포인트들)
export * from './emotionApi';
