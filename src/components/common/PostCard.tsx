import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';
import SavePlaylistModal from './SavePlaylistModal';
import SpotifyPlayerModal from './SpotifyPlayerModal';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  useCommentLike,
  useCommentLikeStatus,
  useCommentLikeCount,
} from '@/queries/useCommentQueries';
import {
  usePostLike,
  usePostLikeStatus,
  usePostLikeCount,
  useUpdatePost,
} from '@/queries/usePostQueries';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(relativeTime);
dayjs.locale('ko');
import {
  Heart,
  MessageCircle,
  Share2,
  Lock,
  User,
  ChevronDown,
  ChevronUp,
  Music,
} from 'lucide-react';

export type Track = {
  id: number;
  artist: string;
  duration: string;
  cover?: string;
  album?: string;
};

export type Post = {
  id: number;
  description: string;
  likes: number;
  comments: number;
  isPrivate: boolean;
  createdAt: string;
  tags: string[];
  trackCount?: number;
  duration?: string;
  spotifyUri?: string;
  playlist: Track[];
  user: {
    name: string; // 닉네임/이름
    username: string; // 아이디
    avatar?: string;
    [key: string]: any;
  };
  commentsPreview?: Array<{
    id: number;
    username?: string;
    userProfileName?: string;
    content: string;
    createdAt: string;
  }>;
  commentsCount?: number;
};

interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
  isDarkMode?: boolean;
  setSpotifyModalUri?: (uri: string) => void;
  onLike?: () => void;
  onComment?: () => void;
  defaultPlaylistExpanded?: boolean;
  defaultCommentsExpanded?: boolean;
  onPostEdited?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  showAuthor = false,
  setSpotifyModalUri,
  onLike,
  defaultPlaylistExpanded = false,
  defaultCommentsExpanded = false,
  onPostEdited,
}) => {
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(defaultPlaylistExpanded);
  const [showCommentsPreview, setShowCommentsPreview] = useState(defaultCommentsExpanded);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [spotifyModalUri, setSpotifyModalUriLocal] = useState<string | null>(null);
  const location = useLocation();

  // 댓글 쿼리
  const {
    data: comments = [],
    refetch: refetchComments,
    isLoading: isCommentsLoading,
  } = useComments(post.id);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const postId = post.id;
  const { data: likeStatusData } = usePostLikeStatus(postId);
  const { data: likeCountData, refetch: refetchLikeCount } = usePostLikeCount(postId);
  const postLikeMutation = usePostLike(postId);
  const liked = likeStatusData?.data?.liked;
  const likeCount = likeCountData?.data?.likeCount ?? post.likes;

  // CustomUserDetails 생성 (임시: 권한 등은 하드코딩)
  const getCustomUserDetails = () => ({
    enabled: true,
    id: user?.id ? Number(user.id) : 0,
    password: '',
    authorities: [{ authority: 'USER' }],
    username: user?.name || user?.email || '',
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired: true,
  });

  // 댓글 등록/대댓글
  const handleAddComment = async (e: React.FormEvent, parentId?: number, inputValue?: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginModalMessage('댓글을 작성하려면 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }
    const value = inputValue !== undefined ? inputValue : commentInput;
    if (!value.trim() && !parentId) return;
    if (parentId && !value.trim()) return;
    await createCommentMutation.mutateAsync({
      postId: post.id,
      content: value,
      parentId: parentId || undefined,
    });
    if (parentId) {
      setReplyTo(null);
    } else {
      setCommentInput('');
    }
    refetchComments();
  };

  // 댓글 수정
  const handleEditComment = async (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginModalMessage('댓글을 수정하려면 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }
    if (!commentInput.trim()) return;
    await updateCommentMutation.mutateAsync({
      id: commentId,
      content: commentInput,
      postId: post.id,
    });
    setEditId(null);
    setCommentInput('');
    refetchComments();
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!isAuthenticated) {
      setLoginModalMessage('댓글을 삭제하려면 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }
    await deleteCommentMutation.mutateAsync({ id: commentId, postId: post.id });
    refetchComments();
  };

  const navigate = useNavigate();
  const emotion = post.emotion || '무기력한 상태';
  const mood = post.mood || '반대 기분';

  const playlistLength = post.playlist?.length || 0;
  // 대표 곡 이미지(첫 곡 cover) 우선 사용
  const playlistCover =
    post.playlist?.tracks?.[0]?.imageUrl ||
    post.playlist?.tracks?.[0]?.albumCover ||
    post.playlist?.tracks?.[0]?.cover ||
    'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427';
  const playlistArtist = post.playlist?.[0]?.artist || '';
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // dominant color 추출 함수, getContrastTextColor 등은 그대로 유지
  function getDominantColor(img: HTMLImageElement): string | null {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, img.naturalWidth / 2 - 0.5, img.naturalHeight / 2 - 0.5, 1, 1, 0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const r = data[0],
        g = data[1],
        b = data[2];
      return `rgb(${r},${g},${b})`;
    } catch {
      return null;
    }
  }
  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.onload = () => {
        const color = getDominantColor(imgRef.current!);
        setDominantColor(color);
      };
      if (imgRef.current.complete) {
        const color = getDominantColor(imgRef.current);
        setDominantColor(color);
      }
    }
  }, [playlistCover]);
  function getContrastTextColor(bg: string | null, opacity: number = 1) {
    if (!bg) return `rgba(34,34,34,${opacity})`;
    // 밝은 회색 계열이면 무조건 검정
    if (
      bg === '#f5f5f5' ||
      bg === 'rgb(245,245,245)' ||
      /^#f5f5f5$/i.test(bg) ||
      /^rgb\(245,\s*245,\s*245\)$/i.test(bg)
    ) {
      return `rgba(34,34,34,${opacity})`;
    }
    const match = bg.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!match) return `rgba(34,34,34,${opacity})`;
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    // 밝으면 어두운색, 어두우면 흰색
    return yiq >= 180 ? `rgba(34,34,34,${opacity})` : `rgba(255,255,255,${opacity})`;
  }
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.user && post.user.username && post.user.username !== '나') {
      navigate(`/${post.user.username}`);
    }
  };
  const requireLogin = (message: string) => {
    if (!isAuthenticated) {
      setLoginModalMessage(message);
      setShowLoginModal(true);
      return true;
    }
    return false;
  };

  const [replyTo, setReplyTo] = useState<number | null>(null); // 대댓글 입력창 노출용
  const [editId, setEditId] = useState<number | null>(null); // 수정중인 댓글 id
  const [editContent, setEditContent] = useState('');

  // 대댓글 단일 항목 컴포넌트 (재귀)
  const CommentItem = ({
    comment,
    user,
    isAuthenticated,
    setLoginModalMessage,
    setShowLoginModal,
    handleEditComment,
    handleDeleteComment,
    handleAddComment,
    replyTo,
    setReplyTo,
    editId,
    setEditId,
    commentInput,
    setCommentInput,
    depth = 0,
    renderComments,
  }: any) => {
    const { data: commentLikeStatusData } = useCommentLikeStatus(comment.id);
    const { data: commentLikeCountData, refetch: refetchCommentLikeCount } = useCommentLikeCount(
      comment.id
    );
    const commentLikeMutation = useCommentLike(comment.id);
    const commentLiked = commentLikeStatusData?.data?.liked;
    const commentLikeCount = commentLikeCountData?.data?.likeCount ?? comment.likeCount;
    const handleCommentLike = () => {
      if (!isAuthenticated) {
        setLoginModalMessage('댓글 좋아요를 누르려면 로그인이 필요합니다.');
        setShowLoginModal(true);
        return;
      }
      commentLikeMutation.mutate();
      refetchCommentLikeCount();
    };
    const [localInput, setLocalInput] = useState('');
    return (
      <div className={`mb-2 flex items-start gap-2 ${depth > 0 ? 'ml-8' : ''}`}>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100'>
          <User size={18} className='text-indigo-400' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <div className='text-sm font-medium text-gray-800'>
              {comment.username || comment.userProfileName}
            </div>
            {/* 댓글 좋아요 버튼 */}
            <button
              className='ml-2 flex items-center gap-1 text-[15px] text-[#888]'
              onClick={handleCommentLike}
              aria-label='댓글 좋아요'
            >
              <Heart
                size={16}
                fill={commentLiked ? '#ef4444' : 'none'}
                color={commentLiked ? '#ef4444' : 'var(--stroke)'}
                style={{ filter: commentLiked ? 'drop-shadow(0 0 2px #ef4444)' : 'none' }}
              />
              <span>{commentLikeCount}</span>
            </button>
          </div>
          <div className='mb-1 text-xs text-gray-400'>{dayjs(comment.createdAt).fromNow()}</div>
          {editId === comment.id ? (
            <form className='flex gap-2' onSubmit={e => handleEditComment(e, comment.id)}>
              <input
                className='flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 focus:outline-none'
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                maxLength={200}
                required
              />
              <button
                type='submit'
                className='rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white'
              >
                저장
              </button>
              <button
                type='button'
                className='rounded-lg px-3 py-1 text-xs font-semibold text-gray-500'
                onClick={() => setEditId(null)}
              >
                취소
              </button>
            </form>
          ) : (
            <div className='text-sm whitespace-pre-line text-gray-700'>{comment.content}</div>
          )}
          <div className='mt-1 flex gap-2'>
            <button
              className='text-xs text-gray-500 hover:text-blue-500 hover:underline'
              onClick={() => setReplyTo(comment.id)}
            >
              답글
            </button>
            {user && user.username === comment.username && (
              <>
                <button
                  className='text-xs text-gray-500 hover:text-green-500 hover:underline'
                  onClick={() => {
                    setEditId(comment.id);
                    setCommentInput(comment.content);
                  }}
                >
                  수정
                </button>
                <button
                  className='text-xs text-gray-500 hover:text-red-500 hover:underline'
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  삭제
                </button>
              </>
            )}
          </div>
          {/* 대댓글 입력창 */}
          {replyTo === comment.id && (
            <form
              className='mt-2 flex gap-2'
              onSubmit={e => {
                e.preventDefault();
                if (!localInput.trim()) return;
                handleAddComment(e, comment.id, localInput);
                setLocalInput('');
              }}
            >
              <input
                className='flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 focus:outline-none'
                placeholder={`@${comment.username || comment.userProfileName}에게 답글 달기`}
                value={localInput}
                onChange={e => setLocalInput(e.target.value)}
                maxLength={200}
                required
              />
              <button
                type='submit'
                className='rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white'
              >
                등록
              </button>
              <button
                type='button'
                className='rounded-lg px-3 py-1 text-xs font-semibold text-gray-500'
                onClick={() => {
                  setReplyTo(null);
                  setLocalInput('');
                }}
              >
                취소
              </button>
            </form>
          )}
          {/* 대댓글 재귀 렌더 */}
          {comment.children &&
            comment.children.length > 0 &&
            renderComments(comment.children, depth + 1)}
        </div>
      </div>
    );
  };

  // 대댓글 재귀 렌더 함수
  const renderComments = (comments: any[], depth = 0) =>
    comments.map(c => (
      <CommentItem
        key={c.id}
        comment={c}
        user={user}
        isAuthenticated={isAuthenticated}
        setLoginModalMessage={setLoginModalMessage}
        setShowLoginModal={setShowLoginModal}
        handleEditComment={handleEditComment}
        handleDeleteComment={handleDeleteComment}
        handleAddComment={handleAddComment}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        editId={editId}
        setEditId={setEditId}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        depth={depth}
        renderComments={renderComments}
      />
    ));

  // 좋아요 버튼 클릭
  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginModalMessage('좋아요를 누르려면 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }
    postLikeMutation.mutate();
    refetchLikeCount();
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`, {
      state: { from: location.pathname, scrollY: window.scrollY },
    });
  };

  // 포스트 수정/삭제 권한: user.username === post.userName
  const canEditPost =
    user && post && user.username && post.user && user.username === post.user.username;

  // 포스트 수정/삭제 상태 (중복 선언 제거)
  const [showEditModal, setShowEditModal] = useState(false);
  const updatePostMutation = useUpdatePost();
  const handleEditPost = () => setShowEditModal(true);
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleSaveEditPost = (data: any) => {
    updatePostMutation.mutate(data, {
      onSuccess: () => {
        setShowEditModal(false);
        if (typeof onPostEdited === 'function') {
          onPostEdited();
        }
      },
      onError: () => {
        alert('포스트 수정에 실패했습니다.');
      },
    });
  };

  const handleDeletePost = () => {
    if (window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
      alert('포스트 삭제 기능은 추후 구현 예정입니다.');
    }
  };

  // 재생시간 포맷 함수
  function formatDuration(sec: number) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `총 ${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `총 ${minutes}분 ${seconds}초`;
    } else {
      return `총 ${seconds}초`;
    }
  }

  // dominantColor가 너무 어두우면 밝은 색으로 fallback
  function getPlaylistBgColor() {
    if (!dominantColor) return '#f5f5f5';
    // rgb(19,21,20) 등 너무 어두우면 밝은 회색으로
    const match = dominantColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!match) return dominantColor;
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 60 ? '#f5f5f5' : dominantColor;
  }

  // 모든 댓글(부모+대댓글) 카운트 함수
  function getTotalCommentCount(comments: any[]): number {
    if (!Array.isArray(comments)) return 0;
    return comments.reduce(
      (acc, c) => acc + 1 + (c.children ? getTotalCommentCount(c.children) : 0),
      0
    );
  }

  return (
    <div
      className='mb-4 rounded-[16px] p-5 font-sans'
      style={{ background: 'var(--surface)', border: '1px solid var(--stroke)' }}
    >
      {/* Header Section */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className='h-8 w-8 cursor-pointer overflow-hidden rounded-full'
            style={{ background: 'var(--surface-alt)' }}
            onClick={handleAuthorClick}
          >
            <img
              src={
                post.user?.avatar ||
                'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish'
              }
              alt=''
              className='h-full w-full object-cover'
            />
          </div>
          <div className='cursor-pointer' onClick={handleAuthorClick}>
            <div className='flex items-center gap-2'>
              <span className='text-[15px] font-bold' style={{ color: 'var(--text-primary)' }}>
                {post.user?.name || '이름없음'}
              </span>
              {post.user?.username && (
                <span className='text-xs text-gray-400'>@{post.user.username}</span>
              )}
            </div>
            <p className='text-[13px]' style={{ color: 'var(--text-secondary)' }}>
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>
        {post.isPrivate && (
          <div
            className='flex items-center gap-1 rounded-full px-2 py-1 text-[12px]'
            style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}
          >
            <Lock size={14} className='mr-1' />
            PRIVATE
          </div>
        )}
        {/* 포스트 수정/삭제 버튼 (본인만) */}
        {canEditPost && (
          <div className='ml-2 flex gap-2'>
            <button
              className='text-xs text-gray-500 hover:text-green-500 hover:underline'
              onClick={handleEditPost}
            >
              수정
            </button>
            <button
              className='text-xs text-gray-500 hover:text-red-500 hover:underline'
              onClick={handleDeletePost}
            >
              삭제
            </button>
          </div>
        )}
      </div>
      {/* 포스트 수정 폼 (인라인) */}
      <SavePlaylistModal
        open={showEditModal}
        onClose={handleCloseEditModal}
        playlist={
          Array.isArray(post.playlist?.tracks) && post.playlist.tracks.length > 0
            ? post.playlist.tracks.map((track, idx) => ({
                id: track.id ?? idx + 1,
                title: track.title ?? '제목 없음',
                artist: track.artist ?? '',
                duration: track.duration ?? '',
                albumCover:
                  track.cover ??
                  track.albumCover ??
                  'https://via.placeholder.com/64x64?text=No+Track',
                spotifyUrl: track.spotifyUrl ?? '',
                order: idx + 1,
                album: track.album,
              }))
            : [
                {
                  id: 0,
                  title: '플레이리스트 없음',
                  artist: '',
                  duration: '',
                  albumCover: 'https://via.placeholder.com/64x64?text=No+Track',
                  spotifyUrl: '',
                  order: 1,
                },
              ]
        }
        initialDescription={post.description}
        initialTags={(post.tags || []).map((t, i) => ({ id: i + 1, name: t }))}
        isPublic={!post.isPrivate}
        loading={updatePostMutation.isLoading}
        error={updatePostMutation.isError ? '포스트 수정에 실패했습니다.' : undefined}
        onSave={({ description, tags, isPublic }) =>
          handleSaveEditPost({
            id: post.id,
            content: description,
            isPublic,
            tags: tags.map(t => t.name),
          })
        }
        authorUsername={post.user?.username}
        authorAvatar={post.user?.avatar}
        isEditMode={true}
      />
      {/* Description */}
      <p className='mb-3 line-clamp-2 text-[15px]' style={{ color: 'var(--text-secondary)' }}>
        {post.description}
      </p>
      {/* Playlist Preview Section */}
      <div
        className='mb-4 flex flex-col gap-2 rounded-[12px] px-4 py-3'
        style={{ background: getPlaylistBgColor(), border: '1px solid var(--stroke)' }}
      >
        <div className='flex w-full flex-row items-center gap-4'>
          {/* 앨범(대표 트랙) 이미지 */}
          <img
            alt='Playlist cover'
            className='h-16 w-16 rounded-lg border border-[#E5E5E5] object-cover'
            src={playlistCover}
            ref={imgRef}
            crossOrigin='anonymous'
          />
          {/* 우측 정보 */}
          <div className='flex h-full min-w-0 flex-1 flex-col justify-between'>
            {/* 윗줄: 대표 곡 타이틀 + 곡수 */}
            <div className='flex min-w-0 items-center justify-between'>
              <span
                className='truncate text-[15px] font-semibold'
                style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
              >
                {post.playlist?.tracks?.[0]?.title || playlistArtist}
              </span>
              <span
                className='ml-2 text-xs'
                style={{ color: getContrastTextColor(getPlaylistBgColor(), 0.7) }}
              >
                {post.playlist?.totalTracks
                  ? `외 ${post.playlist.totalTracks - 1}곡`
                  : post.playlist?.tracks?.length > 1
                    ? `외 ${post.playlist.tracks.length - 1}곡`
                    : ''}
              </span>
            </div>
            {/* 총 재생시간, 스포티파이 버튼, 펼치기 버튼 한 줄: 총 n분은 왼쪽, 버튼 2개는 오른쪽 정렬 */}
            <div className='mt-2 flex items-center justify-between gap-2'>
              {post.playlist?.totalLengthSec && (
                <span
                  className='text-xs font-semibold'
                  style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
                >
                  {formatDuration(post.playlist.totalLengthSec)}
                </span>
              )}
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    const playlistId = post.playlist?.spotifyUrl;
                    if (playlistId) {
                      const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
                      setSpotifyModalUriLocal(embedUrl);
                    }
                  }}
                  className='inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold'
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    height: '2rem',
                    minWidth: 0,
                  }}
                >
                  <Music size={16} style={{ color: '#fff' }} />
                  스포티파이로 듣기
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsPlaylistExpanded(v => !v);
                  }}
                  className='inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs'
                  style={{
                    background: 'var(--surface)',
                    color: getContrastTextColor(getPlaylistBgColor()),
                    height: '2rem',
                    minWidth: 0,
                  }}
                  aria-label={isPlaylistExpanded ? '플레이리스트 닫기' : '플레이리스트 열기'}
                >
                  {isPlaylistExpanded ? (
                    <ChevronUp size={16} color='#000' />
                  ) : (
                    <ChevronDown size={16} color='#000' />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {isPlaylistExpanded && (
          <div
            className='mt-3 max-h-56 overflow-y-auto pt-3'
            style={{
              background: getPlaylistBgColor(),
              borderRadius: 12,
              borderTop: `1.5px solid ${getContrastTextColor(dominantColor) === '#fff' ? 'rgba(255,255,255,0.3)' : '#bbb'}`,
            }}
          >
            <ul
              style={{
                borderTop: 'none',
                borderRadius: 12,
              }}
            >
              {post.playlist?.tracks && post.playlist.tracks.length > 0 ? (
                post.playlist.tracks.map((track, idx) => (
                  <li
                    key={track.id || idx}
                    className='flex items-center gap-3 py-2'
                    style={{
                      borderBottom:
                        idx !== post.playlist.tracks.length - 1
                          ? `1px solid ${getContrastTextColor(dominantColor) === '#fff' ? 'rgba(255,255,255,0.3)' : '#bbb'}`
                          : 'none',
                    }}
                  >
                    <img
                      src={track.imageUrl || track.albumCover || track.cover || playlistCover}
                      alt={track.artist}
                      className='h-10 w-10 shrink-0 rounded-[6px] border border-[#E5E5E5] object-cover'
                    />
                    <span
                      className='flex-1 truncate text-left text-[15px] font-medium'
                      style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
                    >
                      {track.title}
                    </span>
                    <span
                      className='w-32 truncate text-right text-[14px] font-normal'
                      style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
                    >
                      {track.artist}
                    </span>
                    <span
                      className='ml-2 text-right text-[13px]'
                      style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
                    >
                      {track.duration}
                    </span>
                  </li>
                ))
              ) : (
                <li
                  className='py-2 text-[14px]'
                  style={{ color: getContrastTextColor(dominantColor) }}
                >
                  트랙 리스트가 없습니다.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {/* 태그 뱃지 (플레이리스트 미리보기 아래로 이동) */}
      {post.tags && post.tags.length > 0 && (
        <div className='mb-2 flex flex-wrap gap-1'>
          {post.tags.map(tag => (
            <span
              key={tag}
              className='rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {/* SpotifyPlayerModal (내부 상태 관리용) */}
      {spotifyModalUri && !setSpotifyModalUri && (
        <SpotifyPlayerModal uri={spotifyModalUri} onClose={() => setSpotifyModalUriLocal(null)} />
      )}
      {/* Footer Actions */}
      <div className='mt-2 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            className='flex items-center gap-2 text-[17px] font-semibold text-[var(--primary)] transition-transform hover:scale-110'
            onClick={handleLike}
            aria-label='좋아요'
            style={{ minWidth: 48 }}
          >
            <Heart
              size={18}
              fill={liked ? '#ef4444' : 'none'}
              color={liked ? '#ef4444' : 'var(--stroke)'}
              style={{ filter: liked ? 'drop-shadow(0 0 2px #ef4444)' : 'none' }}
            />
            <span>{likeCount}</span>
          </button>
          <button
            className='flex items-center gap-2 text-[15px] text-[#888]'
            aria-label='댓글'
            onClick={handleCommentClick}
          >
            <MessageCircle size={18} />
            <span>{getTotalCommentCount(comments)}</span>
          </button>
        </div>
      </div>
      {/* 댓글 미리보기 */}
      {showCommentsPreview && (
        <div className='mt-4 border-t border-[var(--stroke)] pt-4'>
          {isCommentsLoading ? (
            <div className='text-center text-gray-400'>댓글 불러오는 중...</div>
          ) : comments.length === 0 ? (
            <div className='mb-2 text-sm text-gray-400'>아직 댓글이 없습니다.</div>
          ) : (
            renderComments(comments)
          )}
          {/* 최상위 댓글 입력창 */}
          <form className='mt-2 flex gap-2' onSubmit={e => handleAddComment(e)}>
            <input
              className='flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 focus:outline-none'
              placeholder='댓글을 입력하세요...'
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              maxLength={200}
              required
            />
            <button
              type='submit'
              className='rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white'
              disabled={createCommentMutation.isLoading}
            >
              등록
            </button>
          </form>
        </div>
      )}
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalMessage}
      />
    </div>
  );
};

export default PostCard;
