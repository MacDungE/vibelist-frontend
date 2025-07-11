import React, { useState } from 'react';
import type { Post } from './PostCard';
import type { Comment } from '@/types';

interface PostDetailModalProps {
  isOpen: boolean;
  post: Post | null;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (content: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, post, comments, onClose, onAddComment }) => {
  const [commentInput, setCommentInput] = useState('');
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xl w-full relative flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="닫기"
        >
          &times;
        </button>
        {/* --- 포스트 전체 내용 (PostCard와 유사) --- */}
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full overflow-hidden bg-[#F5F5F5] cursor-pointer"
            >
              <img
                src={post.authorAvatar || "https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#222]">{post.author || '@musiclover2024'}</p>
              <p className="text-[13px] text-[#888]">{post.createdAt}</p>
            </div>
          </div>
          {post.isPrivate && (
            <div className="bg-[#F5F5F5] text-[#888] px-2 py-1 rounded-full text-[12px] flex items-center gap-1">
              <i className="fas fa-lock text-xs"></i>
              PRIVATE
            </div>
          )}
        </div>
        {/* Description */}
        <p className="text-[15px] text-[#444] mb-3 line-clamp-2">{post.description}</p>
        {/* Playlist Preview Section */}
        <div className="bg-[#FAFAFA] rounded-[12px] px-4 py-3 mb-4 flex flex-col gap-2 border border-[#F0F0F0]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                alt="Playlist cover"
                className="w-14 h-14 rounded-[8px] object-cover shrink-0 border border-[#E5E5E5]"
                src={post.playlist?.[0]?.cover || 'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427'}
              />
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-medium text-[#222] truncate max-w-[140px] text-[15px]">{post.playlist?.[0]?.artist || ''}</span>
                <span className="text-[13px] text-[#888]">외 {Math.max(0, (post.playlist?.length || 0) - 1)}곡</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 sm:mt-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] rounded-full">
                <i className="fas fa-smile text-[#888] text-xs"></i>
                <span className="text-[13px] text-[#888]">{post.emotion || '무기력한 상태'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] rounded-full">
                <i className="fas fa-arrow-up text-[#888] text-xs"></i>
                <span className="text-[13px] text-[#888]">{post.mood || '반대 기분'}</span>
              </div>
              <div className="flex items-center gap-1 text-[13px] text-[#888]">
                <i className="far fa-clock"></i>
                <span>{post.createdAt}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => post.spotifyUri && window.open(`https://open.spotify.com/playlist/${post.spotifyUri.split(':').pop()}`)}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#1DB954] text-[18px] mt-2 sm:mt-0"
              aria-label="스포티파이로 듣기"
            >
              <i className="fab fa-spotify"></i>
            </button>
          </div>
          <div className="w-full flex mt-1">
            <button
              type="button"
              onClick={() => post.spotifyUri && window.open(`https://open.spotify.com/playlist/${post.spotifyUri.split(':').pop()}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F5] text-[#1DB954] font-semibold text-[14px]"
            >
              <i className="fab fa-spotify text-[18px]"></i>
              스포티파이로 듣기
            </button>
          </div>
          <div className="mt-3 border-t border-[#F0F0F0] pt-3 max-h-56 overflow-y-auto bg-transparent">
            <ul className="divide-y divide-[#F0F0F0]">
              {post.playlist && post.playlist.length > 0 ? (
                post.playlist.map((track) => (
                  <li key={track.id} className="py-2 flex items-center gap-3">
                    <img
                      src={track.cover || post.playlist?.[0]?.cover || 'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427'}
                      alt={track.artist}
                      className="w-10 h-10 rounded-[6px] object-cover shrink-0 border border-[#E5E5E5]"
                    />
                    <span className="flex-1 truncate font-medium text-[#222] text-[15px]">{track.artist}</span>
                    <span className="text-[13px] text-[#888] ml-2">{track.duration}</span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-[14px] text-[#BBB]">트랙 리스트가 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 text-[#888] text-[15px]"
              // onClick={onLike} // 상세 모달에서는 좋아요/댓글 액션은 비활성화(필요시 연결)
              disabled
            >
              <i className="fas fa-heart"></i>
              <span>{post.likes}</span>
            </button>
            <button
              className="flex items-center gap-2 text-[#888] text-[15px]"
              // onClick={onComment}
              disabled
            >
              <i className="fas fa-comment"></i>
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-[#888] text-[15px]" disabled>
              <i className="fas fa-share"></i>
            </button>
          </div>
        </div>
        {/* Comments */}
        <div className="flex-1 mb-4">
          <div className="font-semibold mb-2 text-gray-700">댓글</div>
          <div className="max-h-40 overflow-y-auto space-y-3">
            {comments.length === 0 ? (
              <div className="text-gray-400 text-sm">아직 댓글이 없습니다.</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-2">
                  <img
                    src={comment.authorAvatar || 'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=24&height=24&seq=avatar2&orientation=squarish'}
                    alt="author"
                    className="w-7 h-7 rounded-full object-cover mt-0.5"
                  />
                  <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2">
                    <div className="text-xs font-semibold text-gray-700">{comment.author}</div>
                    <div className="text-sm text-gray-800 mb-1 whitespace-pre-line">{comment.content}</div>
                    <div className="text-xs text-gray-400">{comment.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Add Comment */}
        <form
          className="flex gap-2 mt-2"
          onSubmit={e => {
            e.preventDefault();
            if (commentInput.trim()) {
              onAddComment(commentInput.trim());
              setCommentInput('');
            }
          }}
        >
          <textarea
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 resize-none min-h-[40px]"
            placeholder="댓글을 입력하세요..."
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            maxLength={300}
            rows={1}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] text-white font-semibold hover:shadow-lg hover:scale-105 transition"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostDetailModal; 