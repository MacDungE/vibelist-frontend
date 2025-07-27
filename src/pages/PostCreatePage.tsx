import React, { useState, type KeyboardEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsContext } from '@/contexts/PostsContext';
import SavePlaylistModal from '@/components/common/SavePlaylistModal';
import { SAMPLE_POST_THUMBNAILS } from '@/constants/images';
import DocumentTitle from '@/components/seo/DocumentTitle.tsx';

const mockPlaylists = [
  {
    id: 1,
    name: '새벽 감성 플레이리스트',
    cover: SAMPLE_POST_THUMBNAILS.MIDNIGHT_LOFI,
  },
  {
    id: 2,
    name: '운동할 때 듣는 신나는 음악',
    cover: SAMPLE_POST_THUMBNAILS.GYM_WORKOUT,
  },
  {
    id: 3,
    name: '비 오는 날의 재즈',
    cover: SAMPLE_POST_THUMBNAILS.RAINY_JAZZ,
  },
];

const emotionOptions = ['즐거운', '차분한', '무기력한', '활기찬', '우울한', '걱정되는'];

const PostCreatePage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('즐거운');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { posts, setPosts } = useContext(PostsContext);
  const navigate = useNavigate();

  // 고정 태그 생성 함수
  function getFixedTagText(emotion: string) {
    return `${emotion} 상태에서 플레이리스트 공유하기`;
  }
  function getFixedTagValue(emotion: string) {
    return `${emotion}_상태에서_플레이리스트_공유하기`;
  }
  const fixedTag = {
    id: -1,
    name: getFixedTagValue(selectedEmotion),
    displayName: getFixedTagText(selectedEmotion),
    emotion: selectedEmotion,
    mood: '',
    fixed: true,
  };

  // 플레이리스트 정보 변환 (mock)
  const playlist = selectedPlaylist
    ? [
        {
          id: 1,
          title: mockPlaylists.find(p => p.id === selectedPlaylist)?.name || '',
          artist: '',
          duration: '',
          albumCover: mockPlaylists.find(p => p.id === selectedPlaylist)?.cover || '',
          spotifyUrl: '',
          order: 1,
        },
      ]
    : [];

  // SavePlaylistModal 저장 핸들러
  const handleSave = ({
    description,
    tags: tagObjs,
    isPublic,
  }: {
    description: string;
    tags: any[];
    isPublic: boolean;
  }) => {
    const newPost = {
      id: Date.now(),
      description,
      likes: 0,
      comments: 0,
      isPrivate: !isPublic,
      createdAt: '방금 전',
      tags: [fixedTag.name, ...tagObjs.map(t => t.name)],
      trackCount: 10,
      duration: '40분',
      spotifyUri: '',
      playlist: playlist,
      author: '나',
      authorAvatar: '',
      emotion: selectedEmotion,
      mood: '',
    };
    setPosts([newPost, ...posts]);
    setShowSaveModal(false);
    navigate('/feed');
  };

  return (
    <div
      className='flex min-h-screen w-full flex-col items-center justify-center pb-20'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <DocumentTitle title={'글 쓰기'} />
      {/* 플레이리스트 선택 모달 */}
      {showPlaylistModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-700'
              onClick={() => setShowPlaylistModal(false)}
              type='button'
            >
              <i className='fas fa-times text-lg'></i>
            </button>
            <h3 className='mb-4 text-lg font-bold'>플레이리스트 선택</h3>
            <div className='flex flex-col gap-3'>
              {mockPlaylists.map(pl => (
                <button
                  key={pl.id}
                  type='button'
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 transition ${selectedPlaylist === pl.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSelectedPlaylist(pl.id);
                    setShowPlaylistModal(false);
                  }}
                >
                  <img src={pl.cover} alt={pl.name} className='h-10 w-10 rounded object-cover' />
                  <span className='font-medium text-gray-800'>{pl.name}</span>
                  {selectedPlaylist === pl.id && (
                    <i className='fas fa-check ml-auto text-indigo-500'></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* SavePlaylistModal로 새 포스트 작성 */}
      <SavePlaylistModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        playlist={playlist}
        initialDescription={description}
        initialTags={tags.map((t, i) => ({ id: i + 1, name: t }))}
        isPublic={isPublic}
        onSave={handleSave}
        fixedTag={fixedTag}
        authorUsername={'나'}
        isEditMode={false}
      />
      {/* 실제로는 SavePlaylistModal을 띄우는 버튼만 노출 */}
      <button
        className='mt-8 w-full max-w-lg rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg'
        onClick={() => setShowSaveModal(true)}
      >
        새 포스트 작성하기
      </button>
      {/* 감정, 플레이리스트, 공개여부 등은 SavePlaylistModal에서 관리됨 */}
    </div>
  );
};

export default PostCreatePage;
