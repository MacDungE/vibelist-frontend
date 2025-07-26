import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostDetail } from '@/http/postApi';
import type { PostDetailResponse } from '@/types/api';
import PostCard from '@/components/common/PostCard';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();

  // 상태
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    getPostDetail(Number(postId))
      .then(res => {
        setPost(res.data.data); // RsDataObject wrapping
        setLoading(false);
      })
      .catch(() => {
        setError('포스트를 불러오지 못했습니다.');
        setLoading(false);
      });
  }, [postId]);

  // refetch 함수 정의
  const refetchPost = () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    getPostDetail(Number(postId))
      .then(res => {
        setPost(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('포스트를 불러오지 못했습니다.');
        setLoading(false);
      });
  };

  if (loading)
    return <div className='flex min-h-screen items-center justify-center'>로딩 중...</div>;
  if (error || !post)
    return (
      <div className='flex min-h-screen items-center justify-center text-red-500'>
        {error || '포스트가 없습니다.'}
      </div>
    );

  return (
    <div
      className='flex min-h-screen w-full flex-col items-center font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='flex w-full max-w-[600px] flex-col px-0 pt-4'>
        {/* PostCard로 상세 표시 (댓글 미리보기/개수 포함) */}
        <div className='mb-6 px-4'>
          <PostCard
            post={post}
            showAuthor={true}
            defaultPlaylistExpanded={true}
            defaultCommentsExpanded={true}
            onPostEdited={refetchPost}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
