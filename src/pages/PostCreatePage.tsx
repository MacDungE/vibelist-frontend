import React, { useState, type KeyboardEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsContext } from '@/contexts/PostsContext';

const mockPlaylists = [
  {
    id: 1,
    name: '새벽 감성 플레이리스트',
    cover: 'https://readdy.ai/api/search-image?query=cozy%20midnight%20bedroom%20with%20soft%20purple%20lighting%20and%20vinyl%20records%20scattered%20on%20wooden%20desk%2C%20aesthetic%20lo-fi%20music%20vibes%20with%20warm%20ambient%20glow&width=80&height=80&seq=post1&orientation=landscape',
  },
  {
    id: 2,
    name: '운동할 때 듣는 신나는 음악',
    cover: 'https://readdy.ai/api/search-image?query=modern%20gym%20interior%20with%20purple%20neon%20lighting%20and%20sleek%20equipment%2C%20energetic%20workout%20atmosphere%20with%20dynamic%20lighting%20effects&width=80&height=80&seq=post2&orientation=landscape',
  },
  {
    id: 3,
    name: '비 오는 날의 재즈',
    cover: 'https://readdy.ai/api/search-image?query=rainy%20window%20view%20with%20jazz%20cafe%20interior%2C%20soft%20purple%20ambient%20lighting%20and%20vintage%20music%20equipment%20in%20cozy%20atmosphere&width=80&height=80&seq=post3&orientation=landscape',
  },
];

const emotionOptions = [
  '즐거운',
  '차분한',
  '무기력한',
  '활기찬',
  '우울한',
  '걱정되는',
];

const PostCreatePage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('즐거운');
  const { posts, setPosts } = useContext(PostsContext);
  const navigate = useNavigate();

  // 태그 입력 핸들러
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // 플레이리스트 선택
  const handleSelectPlaylist = (id: number) => {
    setSelectedPlaylist(id);
    setShowPlaylistModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist) {
      alert('플레이리스트를 선택해주세요!');
      return;
    }

    const newPost = {
      id: Date.now(),
      description,
      likes: 0,
      comments: 0,
      isPrivate: !isPublic,
      createdAt: '방금 전',
      tags,
      trackCount: 10,
      duration: '40분',
      spotifyUri: '',
      playlist: [],
      author: '나',
      authorAvatar: '',
      emotion: selectedEmotion,
      mood: '',
    };
    setPosts([newPost, ...posts]);
    navigate('/feed');
  };

  return (
    <div className="min-h-screen w-full pb-20 flex flex-col items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 mt-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>포스트 작성</h1>
        {/* 플레이리스트 업로드/선택 */}
        <div>
          <label className="block font-medium mb-1">플레이리스트 업로드/선택</label>
          <button
            type="button"
            className="w-full h-24 rounded-lg flex items-center justify-center transition mb-2"
            style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}
            onClick={() => setShowPlaylistModal(true)}
          >
            {selectedPlaylist ? (
              <div className="flex items-center gap-3">
                <img
                  src={mockPlaylists.find(p => p.id === selectedPlaylist)?.cover}
                  alt="선택된 플레이리스트"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {mockPlaylists.find(p => p.id === selectedPlaylist)?.name}
                </span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>플레이리스트 선택하기</span>
            )}
          </button>
          {/* 플레이리스트 선택 모달 */}
          {showPlaylistModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowPlaylistModal(false)}
                  type="button"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
                <h3 className="text-lg font-bold mb-4">플레이리스트 선택</h3>
                <div className="flex flex-col gap-3">
                  {mockPlaylists.map(pl => (
                    <button
                      key={pl.id}
                      type="button"
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg border transition ${selectedPlaylist === pl.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => handleSelectPlaylist(pl.id)}
                    >
                      <img src={pl.cover} alt={pl.name} className="w-10 h-10 rounded object-cover" />
                      <span className="text-gray-800 font-medium">{pl.name}</span>
                      {selectedPlaylist === pl.id && <i className="fas fa-check text-indigo-500 ml-auto"></i>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* 감정 선택 */}
        <div>
          <label className="block font-medium mb-1">감정 선택</label>
          <div className="flex flex-wrap gap-2">
            {emotionOptions.map(emotion => (
              <button
                key={emotion}
                type="button"
                className={`px-4 py-2 rounded-full border text-sm font-medium transition ${selectedEmotion === emotion ? 'bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] text-white border-transparent shadow' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                onClick={() => setSelectedEmotion(emotion)}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>
        {/* 설명 입력 */}
        <div>
          <label className="block font-medium mb-1">설명 <span className="text-red-500">*</span></label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            maxLength={200}
            placeholder="포스트에 대한 설명을 입력하세요."
          />
        </div>
        {/* 태그 입력 */}
        <div>
          <label className="block font-medium mb-1">태그</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={tagInput}
            onChange={handleTagInput}
            onKeyDown={handleTagKeyDown}
            placeholder="엔터 또는 쉼표로 태그 추가"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                #{tag}
                <button
                  type="button"
                  className="ml-2 text-indigo-400 hover:text-red-500 focus:outline-none"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label="태그 삭제"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        {/* 공개여부 스위치 */}
        <div className="flex items-center gap-3">
          <label className="font-medium">공개</label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span className="text-gray-500 text-sm">(비공개로 하면 나만 볼 수 있어요)</span>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] text-white font-semibold hover:shadow-lg transition-all duration-300"
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default PostCreatePage; 