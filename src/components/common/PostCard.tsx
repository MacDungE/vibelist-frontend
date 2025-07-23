import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';
import SavePlaylistModal from './SavePlaylistModal';
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
  author?: string;
  authorAvatar?: string;
  emotion?: string;
  mood?: string;
  thumbnail?: string;
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
  const handleAddComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginModalMessage('댓글을 작성하려면 로그인이 필요합니다.');
      setShowLoginModal(true);
      return;
    }
    if (!commentInput.trim() && !parentId) return;
    if (parentId && !commentInput.trim()) return;
    await createCommentMutation.mutateAsync({
      postId: post.id,
      content: parentId ? commentInput : commentInput,
      parentId: parentId || undefined,
    });
    if (parentId) {
      setReplyTo(null);
      setCommentInput('');
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
  const playlistCover =
    post.playlist?.[0]?.cover || 'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427';
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
  function getContrastTextColor(bg: string | null) {
    if (!bg) return '#fff';
    const match = bg.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!match) return '#fff';
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 180 ? '#222' : '#fff';
  }
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author && post.author !== '나') {
      navigate(`/user/${post.author}`);
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
    return (
      <div className={`mb-2 flex items-start gap-2 ${depth > 0 ? 'ml-8' : ''}`}>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100'>
          <i className='fas fa-user text-indigo-400'></i>
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
              <i
                className='fas fa-heart'
                style={{
                  color: commentLiked ? 'var(--accent)' : 'var(--stroke)',
                  filter: commentLiked ? 'drop-shadow(0 0 2px var(--accent))' : 'none',
                }}
              ></i>
              <span>{commentLikeCount}</span>
            </button>
          </div>
          <div className='mb-1 text-xs text-gray-400'>{comment.createdAt}</div>
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
              className='text-xs text-blue-400 hover:underline'
              onClick={() => setReplyTo(comment.id)}
            >
              답글
            </button>
            {user && user.username === comment.username && (
              <>
                <button
                  className='text-xs text-green-400 hover:underline'
                  onClick={() => {
                    setEditId(comment.id);
                    setCommentInput(comment.content);
                  }}
                >
                  수정
                </button>
                <button
                  className='text-xs text-red-400 hover:underline'
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  삭제
                </button>
              </>
            )}
          </div>
          {/* 대댓글 입력창 */}
          {replyTo === comment.id && (
            <form className='mt-2 flex gap-2' onSubmit={e => handleAddComment(e, comment.id)}>
              <input
                className='flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 focus:outline-none'
                placeholder={`@${comment.username || comment.userProfileName}에게 답글 달기`}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
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
                  setCommentInput('');
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

  // 포스트 수정/삭제 권한: user.username === post.userName
  const canEditPost = user && post && user.username && post.author && user.username === post.author;

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
                post.authorAvatar ||
                'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish'
              }
              alt=''
              className='h-full w-full object-cover'
            />
          </div>
          <div className='cursor-pointer' onClick={handleAuthorClick}>
            <p className='text-[15px] font-bold' style={{ color: 'var(--text-primary)' }}>
              {showAuthor ? post.author || '@musiclover2024' : '@musiclover2024'}
            </p>
            <p className='text-[13px]' style={{ color: 'var(--text-secondary)' }}>
              {post.createdAt}
            </p>
          </div>
        </div>
        {post.isPrivate && (
          <div
            className='flex items-center gap-1 rounded-full px-2 py-1 text-[12px]'
            style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}
          >
            <i className='fas fa-lock text-xs'></i>
            PRIVATE
          </div>
        )}
        {/* 포스트 수정/삭제 버튼 (본인만) */}
        {canEditPost && (
          <div className='ml-2 flex gap-2'>
            <button className='text-xs text-green-500 hover:underline' onClick={handleEditPost}>
              수정
            </button>
            <button className='text-xs text-red-500 hover:underline' onClick={handleDeletePost}>
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
          Array.isArray(post.playlist) && post.playlist.length > 0
            ? post.playlist.map((track, idx) => ({
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
        authorUsername={post.author}
        authorAvatar={post.authorAvatar}
        isEditMode={true}
      />
      {/* Description */}
      <p className='mb-3 line-clamp-2 text-[15px]' style={{ color: 'var(--text-secondary)' }}>
        {post.description}
      </p>
      {/* Playlist Preview Section */}
      <div
        className='mb-4 flex flex-col gap-2 rounded-[12px] px-4 py-3'
        style={{ background: dominantColor || 'transparent', border: '1px solid var(--stroke)' }}
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
            {/* 윗줄: 타이틀 + 태그들 오른쪽 */}
            <div className='flex min-w-0 items-center justify-between'>
              <span
                className='truncate text-[15px] font-semibold'
                style={{ color: getContrastTextColor(dominantColor) }}
              >
                {playlistArtist}
              </span>
              <div className='flex gap-1'>
                <span
                  className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1'
                  style={{
                    background: 'var(--primary)',
                    color: getContrastTextColor(dominantColor),
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <i
                    className='fas fa-smile text-xs'
                    style={{ color: getContrastTextColor(dominantColor) }}
                  ></i>
                  <span className='text-[13px] font-semibold'>{emotion}</span>
                </span>
                <span
                  className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1'
                  style={{
                    background: 'var(--primary)',
                    color: getContrastTextColor(dominantColor),
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <i
                    className='fas fa-arrow-up text-xs'
                    style={{ color: getContrastTextColor(dominantColor) }}
                  ></i>
                  <span className='text-[13px] font-semibold'>{mood}</span>
                </span>
              </div>
            </div>
            {/* 아랫줄: 곡수 + 스포티파이 + 토글 오른쪽 */}
            <div className='mt-2 flex items-center justify-between'>
              <span className='text-[13px]' style={{ color: getContrastTextColor(dominantColor) }}>
                외 {Math.max(0, playlistLength - 1)}곡
              </span>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    post.spotifyUri && setSpotifyModalUri && setSpotifyModalUri(post.spotifyUri)
                  }
                  className='inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold'
                  style={{
                    background: 'var(--accent)',
                    color: getContrastTextColor(dominantColor),
                    height: '2rem',
                    minWidth: 0,
                  }}
                >
                  <i
                    className='fab fa-spotify text-[15px]'
                    style={{ color: getContrastTextColor(dominantColor) }}
                  ></i>
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
                    color: getContrastTextColor(dominantColor),
                    height: '2rem',
                    minWidth: 0,
                  }}
                  aria-label={isPlaylistExpanded ? '플레이리스트 닫기' : '플레이리스트 열기'}
                >
                  <i className={`fas fa-chevron-${isPlaylistExpanded ? 'up' : 'down'}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {isPlaylistExpanded && (
          <div
            className='mt-3 max-h-56 overflow-y-auto pt-3'
            style={{
              background: dominantColor || 'transparent',
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
              {post.playlist && post.playlist.length > 0 ? (
                post.playlist.map((track, idx) => (
                  <li
                    key={track.id}
                    className='flex items-center gap-3 py-2'
                    style={{
                      borderBottom:
                        idx !== post.playlist.length - 1
                          ? `1px solid ${getContrastTextColor(dominantColor) === '#fff' ? 'rgba(255,255,255,0.3)' : '#bbb'}`
                          : 'none',
                    }}
                  >
                    <img
                      src={track.cover || playlistCover}
                      alt={track.artist}
                      className='h-10 w-10 shrink-0 rounded-[6px] border border-[#E5E5E5] object-cover'
                    />
                    <span
                      className='flex-1 truncate text-[15px] font-medium'
                      style={{ color: getContrastTextColor(dominantColor) }}
                    >
                      {track.artist}
                    </span>
                    <span
                      className='ml-2 text-[13px]'
                      style={{ color: getContrastTextColor(dominantColor) }}
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
      {/* Footer Actions */}
      <div className='mt-2 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            className='flex items-center gap-2 text-[17px] font-semibold text-[var(--primary)] transition-transform hover:scale-110'
            onClick={handleLike}
            aria-label='좋아요'
            style={{ minWidth: 48 }}
          >
            <i
              className='fas fa-heart'
              style={{
                color: liked ? 'var(--accent)' : 'var(--stroke)',
                filter: liked ? 'drop-shadow(0 0 2px var(--accent))' : 'none',
              }}
            ></i>
            <span>{likeCount}</span>
          </button>
          <button
            className='flex items-center gap-2 text-[15px] text-[#888]'
            aria-label='댓글'
            onClick={() => setShowCommentsPreview(v => !v)}
          >
            <i className='fas fa-comment'></i>
            <span>{post.commentsCount ?? post.comments ?? 0}</span>
          </button>
          <button className='flex items-center gap-2 text-[15px] text-[#888]'>
            <i className='fas fa-share'></i>
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
