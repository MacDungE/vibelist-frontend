import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';

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
  trackCount: number;
  duration: string;
  spotifyUri: string;
  playlist: Track[];
  author?: string;
  authorAvatar?: string;
  emotion?: string;
  mood?: string;
  thumbnail?: string;
};

interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
  isDarkMode: boolean;
  setSpotifyModalUri: (uri: string) => void;
  onLike?: () => void;
  onComment?: () => void;
}

// 댓글 타입 정의
interface CardComment {
  id: number;
  postId: number;
  author: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  parentId?: number;
  replies?: CardComment[];
}

const PostCard: React.FC<PostCardProps> = ({ post, showAuthor = false, setSpotifyModalUri, onLike }) => {
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const emotion = post.emotion || '무기력한 상태';
  const mood = post.mood || '반대 기분';

  const playlistLength = post.playlist?.length || 0;
  const playlistCover = post.playlist?.[0]?.cover || 'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427';
  const playlistArtist = post.playlist?.[0]?.artist || '';
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 댓글/대댓글 상태
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null); // 대댓글 입력창 노출용
  const [commentInput, setCommentInput] = useState('');
  // mock 댓글 데이터 (실제는 props/context로 대체)
  const [comments, setComments] = useState<CardComment[]>([
    { id: 1, postId: post.id, author: '재즈러버', authorUsername: 'jazzlover', content: '정말 감성적인 곡들이네요!', createdAt: '1일 전' },
    { id: 2, postId: post.id, author: '음악러버', authorUsername: 'musiclover', content: '감사합니다! 새벽에 듣기 좋아요.', createdAt: '23시간 전', parentId: 1 },
    { id: 3, postId: post.id, author: '운동러버', authorUsername: 'fituser', content: '운동할 때 에너지 UP!', createdAt: '2일 전' },
  ]);

  // dominant color 추출 함수
  function getDominantColor(img: HTMLImageElement): string | null {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      // 중앙 1픽셀만 추출
      ctx.drawImage(img, img.naturalWidth/2-0.5, img.naturalHeight/2-0.5, 1, 1, 0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const r = data[0], g = data[1], b = data[2];
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
      // 만약 이미 로드된 경우
      if (imgRef.current.complete) {
        const color = getDominantColor(imgRef.current);
        setDominantColor(color);
      }
    }
  }, [playlistCover]);

  // 텍스트 색상: dominantColor의 명도에 따라 결정
  function getContrastTextColor(bg: string | null) {
    if (!bg) return '#fff';
    // rgb(r,g,b)에서 r,g,b 추출
    const match = bg.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!match) return '#fff';
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    // YIQ 공식
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 180 ? '#222' : '#fff';
  }

  // Author click handler
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author && post.author !== '나') {
      navigate(`/user/${post.author}`);
    }
  };

  // 트리 구조 변환
  function buildCommentTree(comments: CardComment[]) {
    const map = new Map<number, (CardComment & { replies: CardComment[] })>();
    comments.forEach(c => map.set(c.id, { ...c, replies: [] }));
    const roots: (CardComment & { replies: CardComment[] })[] = [];
    map.forEach(c => {
      if (c.parentId) {
        map.get(c.parentId)?.replies.push(c);
      } else {
        roots.push(c);
      }
    });
    return roots;
  }
  const commentTree = buildCommentTree(comments);
  // 부모 username 찾기
  const getParentUsername = (parentId?: number) => {
    if (!parentId) return '';
    const parent = comments.find(c => c.id === parentId);
    return parent ? parent.authorUsername : '';
  };
  // 아바타 유틸(임시)
  const getAvatar = (username: string) => `https://readdy.ai/api/search-image?query=avatar%20${username}&width=32&height=32&seq=avatar&orientation=squarish`;

  // 댓글/대댓글 렌더 함수
  const renderComments = (nodes: CardComment[], depth = 0) =>
    nodes.map(c => (
      <div key={c.id} className={`flex gap-2 mb-3 ${depth > 0 ? 'ml-8 border-l-2 border-[var(--stroke)] pl-4' : ''}`}>
        <img src={getAvatar(c.authorUsername)} className="w-8 h-8 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-[var(--text-primary)] text-sm">{c.author}</span>
            <span className="text-xs text-[var(--text-secondary)]">@{c.authorUsername}</span>
            <span className="text-xs text-[var(--text-secondary)]">{c.createdAt}</span>
          </div>
          <div className="text-[15px] text-[var(--text-secondary)] whitespace-pre-line">
            {c.parentId && <span className="text-[var(--primary)] font-semibold mr-1">@{getParentUsername(c.parentId)}</span>}
            {c.content}
          </div>
          <button className="text-xs text-[var(--primary)] mt-1" onClick={() => {
            if (requireLogin('답글을 작성하려면 로그인이 필요합니다.')) return;
            setReplyTo(c.id);
          }}>답글</button>
          {/* 대댓글 입력창 */}
          {replyTo === c.id && (
            <form className="flex gap-2 mt-2" onSubmit={e => {
              e.preventDefault();
              if (requireLogin('답글을 작성하려면 로그인이 필요합니다.')) return;
              if (commentInput.trim()) {
                setComments(prev => [...prev, {
                  id: Date.now(),
                  postId: post.id,
                  author: '나',
                  authorUsername: 'me',
                  content: commentInput,
                  createdAt: '방금 전',
                  parentId: c.id
                }]);
                setCommentInput('');
                setReplyTo(null);
              }
            }}>
              <input
                className="flex-1 px-3 py-1 rounded-lg border border-gray-300 focus:outline-none text-gray-900 text-sm"
                placeholder={`@${c.authorUsername}에게 답글 달기`}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                maxLength={200}
                required
              />
              <button type="submit" className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold">등록</button>
            </form>
          )}
          {/* 대댓글 재귀 */}
          {c.replies && c.replies.length > 0 && renderComments(c.replies, depth + 1)}
        </div>
      </div>
    ));

  // 로그인 필요 함수
  const requireLogin = (message: string) => {
    if (!isLoggedIn) {
      setLoginModalMessage(message);
      setShowLoginModal(true);
      return true;
    }
    return false;
  };

  // 최상위 댓글 입력창
  const renderRootCommentInput = () => (
    <form className="flex gap-2 mt-2" onSubmit={e => {
      e.preventDefault();
      if (requireLogin('댓글을 작성하려면 로그인이 필요합니다.')) return;
      if (commentInput.trim()) {
        setComments(prev => [...prev, {
          id: Date.now(),
          postId: post.id,
          author: '나',
          authorUsername: 'me',
          content: commentInput,
          createdAt: '방금 전'
        }]);
        setCommentInput('');
      }
    }}>
      <input
        className="flex-1 px-3 py-1 rounded-lg border border-gray-300 focus:outline-none text-gray-900 text-sm"
        placeholder="댓글을 입력하세요..."
        value={commentInput}
        onChange={e => setCommentInput(e.target.value)}
        maxLength={200}
        required
      />
      <button type="submit" className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold">등록</button>
    </form>
  );

  return (
    <div className="rounded-[16px] p-5 mb-4 font-sans" style={{ background: 'var(--surface)', border: '1px solid var(--stroke)' }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
            style={{ background: 'var(--surface-alt)' }}
            onClick={handleAuthorClick}
          >
            <img
              src={post.authorAvatar || "https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="cursor-pointer" onClick={handleAuthorClick}>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{showAuthor ? post.author || '@musiclover2024' : '@musiclover2024'}</p>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{post.createdAt}</p>
          </div>
        </div>
        {post.isPrivate && (
          <div className="px-2 py-1 rounded-full text-[12px] flex items-center gap-1" style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}>
            <i className="fas fa-lock text-xs"></i>
            PRIVATE
          </div>
        )}
      </div>
      {/* Description */}
      <p className="text-[15px] mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{post.description}</p>
      {/* Playlist Preview Section */}
      <div
        className="rounded-[12px] px-4 py-3 mb-4 flex flex-col gap-2"
        style={{ background: dominantColor || 'transparent', border: '1px solid var(--stroke)' }}
      >
        <div className="flex flex-row gap-4 w-full items-center">
          {/* 앨범(대표 트랙) 이미지 */}
          <img
            alt="Playlist cover"
            className="w-16 h-16 rounded-lg object-cover border border-[#E5E5E5]"
            src={playlistCover}
            ref={imgRef}
            crossOrigin="anonymous"
          />
          {/* 우측 정보 */}
          <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
            {/* 윗줄: 타이틀 + 태그들 오른쪽 */}
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold truncate text-[15px]" style={{ color: getContrastTextColor(dominantColor) }}>{playlistArtist}</span>
              <div className="flex gap-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--primary)', color: getContrastTextColor(dominantColor), boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <i className="fas fa-smile text-xs" style={{ color: getContrastTextColor(dominantColor) }}></i>
                  <span className="text-[13px] font-semibold">{emotion}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--primary)', color: getContrastTextColor(dominantColor), boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <i className="fas fa-arrow-up text-xs" style={{ color: getContrastTextColor(dominantColor) }}></i>
                  <span className="text-[13px] font-semibold">{mood}</span>
                </span>
              </div>
            </div>
            {/* 아랫줄: 곡수 + 스포티파이 + 토글 오른쪽 */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[13px]" style={{ color: getContrastTextColor(dominantColor) }}>외 {Math.max(0, playlistLength - 1)}곡</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => post.spotifyUri && setSpotifyModalUri(post.spotifyUri)}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs"
                  style={{ background: 'var(--accent)', color: getContrastTextColor(dominantColor), height: '2rem', minWidth: 0 }}
                >
                  <i className="fab fa-spotify text-[15px]" style={{ color: getContrastTextColor(dominantColor) }}></i>
                  스포티파이로 듣기
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setIsPlaylistExpanded(v => !v); }}
                  className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs"
                  style={{ background: 'var(--surface)', color: getContrastTextColor(dominantColor), height: '2rem', minWidth: 0 }}
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
            className="mt-3 pt-3 max-h-56 overflow-y-auto"
            style={{
              background: dominantColor || 'transparent',
              borderRadius: 12,
              borderTop: `1.5px solid ${getContrastTextColor(dominantColor) === '#fff' ? 'rgba(255,255,255,0.3)' : '#bbb'}`
            }}
          >
            <ul style={{
              borderTop: 'none',
              borderRadius: 12,
            }}>
              {post.playlist && post.playlist.length > 0 ? (
                post.playlist.map((track, idx) => (
                  <li
                    key={track.id}
                    className="py-2 flex items-center gap-3"
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
                      className="w-10 h-10 rounded-[6px] object-cover shrink-0 border border-[#E5E5E5]"
                    />
                    <span className="flex-1 truncate font-medium text-[15px]"
                      style={{ color: getContrastTextColor(dominantColor) }}>{track.artist}</span>
                    <span className="text-[13px] ml-2"
                      style={{ color: getContrastTextColor(dominantColor) }}>{track.duration}</span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-[14px]" style={{ color: getContrastTextColor(dominantColor) }}>트랙 리스트가 없습니다.</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 text-[17px] font-semibold text-[var(--primary)] hover:scale-110 transition-transform"
            onClick={() => {
              if (requireLogin('좋아요를 누르려면 로그인이 필요합니다.')) return;
              onLike?.();
            }}
            aria-label="좋아요"
            style={{ minWidth: 48 }}
          >
            <i className="fas fa-heart" style={{ color: post.likes > 0 ? 'var(--accent)' : 'var(--stroke)', filter: post.likes > 0 ? 'drop-shadow(0 0 2px var(--accent))' : 'none' }}></i>
            <span>{post.likes}</span>
          </button>
          <button
            className="flex items-center gap-2 text-[#888] text-[15px]"
            onClick={() => {
              if (requireLogin('댓글을 보려면 로그인이 필요합니다.')) return;
              setShowComments(v => !v);
            }}
          >
            <i className="fas fa-comment"></i>
            <span>{comments.length}</span>
          </button>
          <button className="flex items-center gap-2 text-[#888] text-[15px]">
            <i className="fas fa-share"></i>
          </button>
        </div>
      </div>
      {/* 댓글/대댓글 트리 */}
      {showComments && (
        <div className="mt-4 border-t border-[var(--stroke)] pt-4">
          {renderComments(commentTree)}
          {renderRootCommentInput()}
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