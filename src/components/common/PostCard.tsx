import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';
import SavePlaylistModal from './SavePlaylistModal';
import SpotifyPlayerModal from './SpotifyPlayerModal';
import { NAME_AVATAR_URL } from '@/constants/images';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/queries/useCommentQueries';
import {
  useInViewPostLikeCount,
  useInViewPostLikeStatus,
  usePostLike,
  useUpdatePost,
  useDeletePost, // 추가
} from '@/queries/usePostQueries';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { ChevronDown, ChevronUp, Heart, Lock, MessageCircle, Music } from 'lucide-react';
import type { PostDetailResponse } from '@/types/api.ts';
import { CommentItem } from '@/components/common/CommentItem.tsx';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface PostCardProps {
  post: PostDetailResponse;
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

  // PostCard 가시성 체크를 위한 ref
  const postCardRef = useRef(null);
  // 댓글 쿼리 - 화면에 보일 때만 활성화
  const isInView = useInView(postCardRef, { margin: '50px' });
  const {
    data: comments = [],
    refetch: refetchComments,
    isLoading: isCommentsLoading,
  } = useComments(post.id, isInView);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const postId = post.id;
  // 좋아요 관련 쿼리 - 화면에 보일 때만 활성화
  const { data: likeStatusData } = useInViewPostLikeStatus(postId, isInView);
  const { data: likeCountData, refetch: refetchLikeCount } = useInViewPostLikeCount(
    postId,
    isInView
  );
  const postLikeMutation = usePostLike(postId);
  const liked = likeStatusData?.data?.liked;
  const likeCount = likeCountData?.data?.likeCount ?? post.likeCnt;

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

  const playlistLength = post.playlist?.tracks?.length || 0;
  // 대표 곡 이미지(첫 곡 imageUrl) 우선 사용
  const playlistCover =
    post.playlist?.tracks?.[0]?.imageUrl ||
    'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427';
  const playlistArtist = post.playlist?.tracks?.[0]?.artist || '';
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // dominant color 추출 함수
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
    if (post.userName && post.userName !== '나') {
      navigate(`/${post.userName}`);
    }
  };

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

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
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`, {
      state: { from: location.pathname, scrollY: window.scrollY },
    });
  };

  // 포스트 수정/삭제 권한: user.username === post.userName
  const canEditPost =
    user && post && user.username && post.userName && user.username === post.userName;

  // 포스트 수정/삭제 상태
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

  const deletePostMutation = useDeletePost(); // 추가
  const handleDeletePost = async () => {
    if (window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
      try {
        await deletePostMutation.mutateAsync(post.id);
        alert('포스트가 삭제되었습니다.');
        // 삭제 후 페이지 이동 또는 목록 갱신 등 후처리
        if (location.pathname.includes('/post/')) {
          navigate('/'); // 상세 페이지라면 홈으로 이동
        } else if (typeof onPostEdited === 'function') {
          onPostEdited(); // 목록 갱신 콜백
        }
      } catch (e) {
        alert('포스트 삭제에 실패했습니다.');
      }
    }
  };

  // 재생시간 포맷 함수 (밀리초 → 분:초)
  function formatDuration(durationMs: number) {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // 전체 재생시간 포맷 함수
  function formatTotalDuration(sec: number) {
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
      ref={postCardRef}
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
              src={NAME_AVATAR_URL(post.userProfileName)}
              alt=''
              className='h-full w-full object-cover'
            />
          </div>
          <div className='cursor-pointer' onClick={handleAuthorClick}>
            <div className='flex items-center gap-2'>
              <span className='text-[15px] font-bold' style={{ color: 'var(--text-primary)' }}>
                {post.userProfileName || '이름없음'}
              </span>
              {post.userName && <span className='text-xs text-gray-400'>@{post.userName}</span>}
            </div>
            <p className='text-[13px]' style={{ color: 'var(--text-secondary)' }}>
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>
        {!post.isPublic && (
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

      {/* 포스트 수정 폼 */}
      <SavePlaylistModal
        open={showEditModal}
        onClose={handleCloseEditModal}
        playlist={
          Array.isArray(post.playlist?.tracks) && post.playlist.tracks.length > 0
            ? post.playlist.tracks.map((track, idx) => ({
                id: parseInt(track.trackId) || idx + 1,
                title: track.title || '제목 없음',
                artist: track.artist || '',
                duration: formatDuration(track.durationMs),
                albumCover: track.imageUrl || 'https://via.placeholder.com/64x64?text=No+Track',
                spotifyUrl: '',
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
        initialDescription={post.content}
        initialTags={(post.tags || []).map((t, i) => ({ id: i + 1, name: t }))}
        isPublic={post.isPublic}
        loading={updatePostMutation.isPending}
        error={updatePostMutation.isError ? '포스트 수정에 실패했습니다.' : undefined}
        onSave={({ description, tags, isPublic }) =>
          handleSaveEditPost({
            id: post.id,
            content: description,
            isPublic,
            tags: tags.map(t => t.name),
          })
        }
        authorUsername={post.userName}
        authorAvatar=''
        isEditMode={true}
      />

      {/* Description */}
      <p className='mb-3 line-clamp-2 text-[15px]' style={{ color: 'var(--text-secondary)' }}>
        {post.content}
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
            {/* 총 재생시간, 스포티파이 버튼, 펼치기 버튼 */}
            <div className='mt-2 flex items-center justify-between gap-2'>
              {post.playlist?.totalLengthSec && (
                <span
                  className='text-xs font-semibold'
                  style={{ color: getContrastTextColor(getPlaylistBgColor()) }}
                >
                  {formatTotalDuration(post.playlist.totalLengthSec)}
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
                    key={track.trackId || idx}
                    className='flex items-center gap-3 py-2'
                    style={{
                      borderBottom:
                        idx !== post.playlist.tracks.length - 1
                          ? `1px solid ${getContrastTextColor(dominantColor) === '#fff' ? 'rgba(255,255,255,0.3)' : '#bbb'}`
                          : 'none',
                    }}
                  >
                    <img
                      src={track.imageUrl || playlistCover}
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
                      {formatDuration(track.durationMs)}
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

      {/* 태그 뱃지 */}
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

      {/* SpotifyPlayerModal */}
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
              disabled={createCommentMutation.isPending}
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
