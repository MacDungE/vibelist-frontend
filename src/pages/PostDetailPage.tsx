import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getPostDetail } from '@/http/postApi';
import { getComments } from '@/http/commentApi';
import type { PostDetailResponse, CommentResponseDto, RsDataObject } from '@/types/api';
import PostCard from '@/components/common/PostCard';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();

  // 상태
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!postId) return;
    setCommentLoading(true);
    setCommentError(null);
    getComments(Number(postId))
      .then(res => {
        setComments(Array.isArray(res.data.data) ? res.data.data : []);
        setCommentLoading(false);
      })
      .catch(() => {
        setCommentError('댓글을 불러오지 못했습니다.');
        setCommentLoading(false);
      });
  }, [postId]);

  if (loading || commentLoading)
    return <div className='flex min-h-screen items-center justify-center'>로딩 중...</div>;
  if (error || commentError || !post)
    return (
      <div className='flex min-h-screen items-center justify-center text-red-500'>
        {error || commentError || '포스트가 없습니다.'}
      </div>
    );

  // PostCard에 맞게 데이터 변환
  const cardData = {
    id: post.id,
    description: post.content,
    user: {
      name: post.name || post.userProfileName || post.userName || '',
      username: post.username || post.userName || '',
      avatar: post.avatarUrl || post.userProfileImage || '',
    },
    tags: post.tags,
    createdAt: post.createdAt,
    likes: post.likeCnt,
    comments: comments.length,
    isPrivate: !post.isPublic,
    playlist: {
      tracks:
        post.playlist?.tracks?.map(track => ({
          id: track.trackId,
          artist: track.artist,
          duration: `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}`,
          cover: track.imageUrl,
          title: track.title,
          spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
        })) || [],
      totalTracks: post.playlist?.totalTracks,
      totalLengthSec: post.playlist?.totalLengthSec,
      spotifyUrl: post.playlist?.spotifyUrl,
    },
    commentsPreview: comments.slice(0, 3),
    commentsCount: comments.length,
  };

  return (
    <div
      className='flex min-h-screen w-full flex-col items-center font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='flex w-full max-w-[600px] flex-col px-0 pt-4'>
        {/* PostCard로 상세 표시 (댓글 미리보기/개수 포함) */}
        <div className='mb-6 px-4'>
          <PostCard
            post={cardData}
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
