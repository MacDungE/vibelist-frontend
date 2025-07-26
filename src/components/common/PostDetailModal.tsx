import React, { useState } from 'react';
import type { Post } from './PostCard';

import type { Comment } from '@/types/common.ts';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { DEFAULT_AVATAR_SMALL_URL, DEFAULT_AVATAR_MINI_URL } from '@/constants/images';

interface PostDetailModalProps {
  isOpen: boolean;
  post: Post | null;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (content: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  post,
  comments,
  onClose,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');
  if (!isOpen || !post) return null;

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60'>
      <div className='relative flex w-full max-w-xl flex-col rounded-2xl bg-white p-6 shadow-xl'>
        <button
          className='absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700'
          onClick={onClose}
          aria-label='닫기'
        >
          &times;
        </button>
        {/* --- 포스트 전체 내용 (PostCard와 유사) --- */}
        {/* Header Section */}
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 cursor-pointer overflow-hidden rounded-full bg-[#F5F5F5]'>
              <img
                src={
                  post.authorAvatar ||
                  DEFAULT_AVATAR_SMALL_URL
                }
                alt=''
                className='h-full w-full object-cover'
              />
            </div>
            <div>
              <p className='text-[15px] font-bold text-[#222]'>
                {post.author || '@musiclover2024'}
              </p>
              <p className='text-[13px] text-[#888]'>{post.createdAt}</p>
            </div>
          </div>
          {post.isPrivate && (
            <div className='flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2 py-1 text-[12px] text-[#888]'>
              <i className='fas fa-lock text-xs'></i>
              PRIVATE
            </div>
          )}
        </div>
        {/* Description */}
        <p className='mb-3 line-clamp-2 text-[15px] text-[#444]'>{post.description}</p>
        {/* Playlist Preview Section */}
        <div className='mb-4 flex flex-col gap-2 rounded-[12px] border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-3'>
          <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <img
                alt='Playlist cover'
                className='h-14 w-14 shrink-0 rounded-[8px] border border-[#E5E5E5] object-cover'
                src={
                  post.playlist?.[0]?.cover ||
                  'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427'
                }
              />
              <div className='flex min-w-0 flex-col justify-center'>
                <span className='max-w-[140px] truncate text-[15px] font-medium text-[#222]'>
                  {post.playlist?.[0]?.artist || ''}
                </span>
                <span className='text-[13px] text-[#888]'>
                  외 {Math.max(0, (post.playlist?.length || 0) - 1)}곡
                </span>
              </div>
            </div>
            {/* emotion, mood 태그 제거 */}
            <div className='flex items-center gap-1 text-[13px] text-[#888]'>
              <i className='far fa-clock'></i>
              <span>{post.createdAt}</span>
            </div>
            <button
              type='button'
              onClick={() =>
                post.spotifyUri &&
                window.open(`https://open.spotify.com/playlist/${post.spotifyUri.split(':').pop()}`)
              }
              className='mt-2 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F5] text-[18px] text-[#1DB954] sm:mt-0'
              aria-label='스포티파이로 듣기'
            >
              <i className='fab fa-spotify'></i>
            </button>
          </div>
          {/* 포스트 태그 표시 */}
          {post.tags && post.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className='rounded-full bg-indigo-100 px-3 py-1.5 text-sm text-indigo-800'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className='mt-1 flex w-full'>
            <button
              type='button'
              onClick={() =>
                post.spotifyUri &&
                window.open(`https://open.spotify.com/playlist/${post.spotifyUri.split(':').pop()}`)
              }
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F5F5F5] px-4 py-2 text-[14px] font-semibold text-[#1DB954]'
            >
              <i className='fab fa-spotify text-[18px]'></i>
              스포티파이로 듣기
            </button>
          </div>
          <div className='mt-3 max-h-56 overflow-y-auto border-t border-[#F0F0F0] bg-transparent pt-3'>
            <ul className='divide-y divide-[#F0F0F0]'>
              {post.playlist && post.playlist.length > 0 ? (
                post.playlist.map(track => (
                  <li key={track.id} className='flex items-center gap-3 py-2'>
                    <img
                      src={
                        track.cover ||
                        post.playlist?.[0]?.cover ||
                        'https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427'
                      }
                      alt={track.artist}
                      className='h-10 w-10 shrink-0 rounded-[6px] border border-[#E5E5E5] object-cover'
                    />
                    <span className='flex-1 truncate text-[15px] font-medium text-[#222]'>
                      {track.artist}
                    </span>
                    <span className='ml-2 text-[13px] text-[#888]'>{track.duration}</span>
                  </li>
                ))
              ) : (
                <li className='py-2 text-[14px] text-[#BBB]'>트랙 리스트가 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
        {/* Footer Actions */}
        <div className='mt-2 mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button className='flex items-center gap-2 text-[15px] text-[#888]' disabled>
              <Heart size={18} />
              <span>{post.likes}</span>
            </button>
            <button className='flex items-center gap-2 text-[15px] text-[#888]' disabled>
              <MessageCircle size={18} />
              <span>{post.comments}</span>
            </button>
            <button className='flex items-center gap-2 text-[15px] text-[#888]' disabled>
              <Share2 size={18} />
            </button>
          </div>
        </div>
        {/* Comments */}
        <div className='mb-4 flex-1'>
          <div className='mb-2 font-semibold text-gray-700'>댓글</div>
          <div className='max-h-40 space-y-3 overflow-y-auto'>
            {comments.length === 0 ? (
              <div className='text-sm text-gray-400'>아직 댓글이 없습니다.</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className='flex items-start gap-2'>
                  <img
                    src={
                      comment.authorAvatar ||
                      DEFAULT_AVATAR_MINI_URL
                    }
                    alt='author'
                    className='mt-0.5 h-7 w-7 rounded-full object-cover'
                  />
                  <div className='flex-1 rounded-xl bg-gray-100 px-3 py-2'>
                    <div className='text-xs font-semibold text-gray-700'>{comment.author}</div>
                    <div className='mb-1 text-sm whitespace-pre-line text-gray-800'>
                      {comment.content}
                    </div>
                    <div className='text-xs text-gray-400'>{comment.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Add Comment */}
        <form
          className='mt-2 flex gap-2'
          onSubmit={e => {
            e.preventDefault();
            if (commentInput.trim()) {
              onAddComment(commentInput.trim());
              setCommentInput('');
            }
          }}
        >
          <textarea
            className='min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:outline-none'
            placeholder='댓글을 입력하세요...'
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            maxLength={300}
            rows={1}
            required
          />
          <button
            type='submit'
            className='rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] px-4 py-2 font-semibold text-white transition hover:scale-105 hover:shadow-lg'
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostDetailModal;
