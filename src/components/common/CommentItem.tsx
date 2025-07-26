// 대댓글 단일 항목 컴포넌트 (재귀)
import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import {
  useCommentLike,
  useInViewCommentLikeCount,
  useInViewCommentLikeStatus,
} from '@/queries/useCommentQueries.ts';
import { Heart, User } from 'lucide-react';
import dayjs from 'dayjs';

export const CommentItem = ({
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
  // 댓글 아이템도 화면에 보일 때만 좋아요 정보 가져오기
  const commentRef = useRef<HTMLDivElement>(null);
  const isCommentInView = useInView(commentRef, { margin: '50px' });

  const { data: commentLikeStatusData } = useInViewCommentLikeStatus(comment.id, isCommentInView);
  const { data: commentLikeCountData, refetch: refetchCommentLikeCount } =
    useInViewCommentLikeCount(comment.id, isCommentInView);
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
  };
  const [localInput, setLocalInput] = useState('');
  return (
    <div ref={commentRef} className={`mb-2 flex items-start gap-2 ${depth > 0 ? 'ml-8' : ''}`}>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100'>
        <User size={18} className='text-indigo-400' />
      </div>
      <div className='flex-1'>
        <div className='flex items-center gap-2'>
          <div className='text-sm font-medium text-gray-800'>
            {comment.username || comment.userProfileName}
          </div>
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
        <div className='mb-1 text-xs text-gray-400'>{dayjs(comment.updateAt).fromNow()}</div>
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
