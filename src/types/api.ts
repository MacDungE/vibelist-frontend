// API 관련 공통 타입 정의

// 기본 응답 타입
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// 트랙 관련
export interface TrackRsDto {
  spotifyId: string;
  durationMs: number;
  trackId: string;
  title: string;
  artist: string;
  album: string;
  popularity: number;
  explicit: boolean;
  imageUrl: string;
}

// 추천 요청
export interface RecommendRqDto {
  userValence?: number;
  userEnergy?: number;
  text?: string;
  mode: 'MAINTAIN' | 'ELEVATE' | 'CALM_DOWN' | 'REVERSE';
}

// 게시글 관련
export interface PostCreateRequest {
  tracks: TrackRsDto[];
  content: string;
  tags?: string[];
  isPublic: boolean;
}

export interface PostUpdateRequest {
  id: number;
  content: string;
  tags?: string[];
  isPublic: boolean;
}

export interface PlaylistDetailResponse {
  id: number;
  spotifyUrl: string;
  totalTracks: number;
  totalLengthSec: number;
  tracks: TrackRsDto[];
}

export interface PostDetailResponse {
  id: number;
  userId: number;
  userName: string;
  userProfileName: string;
  content: string;
  isPublic: boolean;
  likeCnt: number;
  viewCnt: number;
  createdAt: string;
  updatedAt: string;
  playlist: PlaylistDetailResponse;
}

// 페이지네이션 관련
export interface SortObject {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject;
  unpaged: boolean;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface PagePostDetailResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: PostDetailResponse[];
  number: number;
  sort: SortObject;
  first: boolean;
  last: boolean;
  pageable: PageableObject;
  numberOfElements: number;
  empty: boolean;
}

// 트렌드 관련
export interface TrendResponse {
  postId: number;
  score: number;
  rank: number;
  previousRank: number;
  trendStatus: 'UP' | 'DOWN' | 'NEW' | 'SAME' | 'OUT';
  rankChange: number;
  postContent: string;
  userName: string;
  userProfileName: string;
  snapshotTime: string;
}

// 댓글 관련
export interface CommentCreateDto {
  postId: number;
  content: string;
  parentId?: number;
}

export interface CommentUpdateDto {
  content: string;
}

export interface CommentResponseDto {
  id: number;
  content: string;
  userId: number;
  username: string;
  userProfileName: string;
  parentId?: number;
  createdAt: string;
  likeCount: number;
  children?: CommentResponseDto[];
}

// 사용자 관련
export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

// 인증 관련
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SocialLoginCallbackResponse {
  accessToken: string;
}

export interface CompleteSocialSignupRequest {
  username: string;
  provider: string;
  userId: string;
}

export interface StatusResponse {
  authenticated: boolean;
  provider?: string;
  email?: string;
  name?: string;
}


// 외부 서비스 연동 관련
export type IntegrationProvider = 'spotify' | 'google';

export interface IntegrationStatus {
  [key: string]: boolean;
}

// 좋아요 관련
export interface LikeStatusRes {
  liked: boolean;
}

export interface LikeCountRes {
  likeCount: number;
}

// 태그 관련
export interface TagSuggestResponse {
  tags: string[];
}

// ElasticSearch 관련
export interface TestEsDoc {
  id: string;
  title: string;
  content: string;
  username: string;
}

// 공통 응답 타입
export interface RsDataObject<T = any> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface RsDataLong {
  success: boolean;
  code: string;
  message: string;
  data: number;
  timestamp: string;
}
