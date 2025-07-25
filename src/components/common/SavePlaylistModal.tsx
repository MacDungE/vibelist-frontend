import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Globe, Lock, Clock } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  albumCover: string;
  spotifyUrl: string;
  order: number;
  album?: string;
}

interface Tag {
  id: number;
  name: string;
  emotion?: string;
  mood?: string;
  fixed?: boolean;
}

interface FixedTag extends Tag {
  emotion: string;
  mood: string;
  fixed: true;
}

interface SavePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  playlist: Track[];
  initialDescription?: string;
  initialTags?: Tag[];
  isPublic?: boolean;
  loading?: boolean;
  error?: string | null;
  onSave: (data: { description: string; tags: Tag[]; isPublic: boolean }) => void;
  onTagSearch?: (query: string) => Promise<Tag[]>;
  fixedTag?: FixedTag;
  onFixedTagClick?: (tag: FixedTag) => void;
  authorUsername?: string;
  authorAvatar?: string;
  isEditMode?: boolean;
}

const SavePlaylistModal: React.FC<SavePlaylistModalProps> = ({
  open,
  onClose,
  playlist,
  initialDescription = '',
  initialTags = [],
  isPublic: initialIsPublic = true,
  loading = false,
  error = null,
  onSave,
  onTagSearch,
  fixedTag,
  onFixedTagClick,
  authorUsername,
  authorAvatar,
  isEditMode = false,
}) => {
  const { user } = useAuth();
  const [description, setDescription] = useState(initialDescription);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [currentTagQuery, setCurrentTagQuery] = useState('');
  const [removingTags, setRemovingTags] = useState<Set<number>>(new Set());
  const [showInlineTagInput, setShowInlineTagInput] = useState(false);
  const [inlineTagPosition, setInlineTagPosition] = useState({ top: 0, left: 0 });
  const [inlineTagValue, setInlineTagValue] = useState('');
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [tagError, setTagError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (open) {
      setDescription(initialDescription);
      setSelectedTags(initialTags);
      setIsPublic(initialIsPublic);
      setTagSuggestions([]);
      setShowTagDropdown(false);
      setCurrentTagQuery('');
      setRemovingTags(new Set());
      setShowInlineTagInput(false);
      setInlineTagPosition({ top: 0, left: 0 });
      setInlineTagValue('');
      setShowInlineSuggestions(false);
      setSelectedSuggestionIndex(0);
      setTagError(null);
    }
  }, [open]);

  // Tag search logic
  const handleTagSearch = async (query: string) => {
    if (!onTagSearch) return [];
    if (!query) return [];
    try {
      const res = await onTagSearch(query);
      setTagSuggestions(res);
      return res;
    } catch {
      setTagSuggestions([]);
      return [];
    }
  };

  // Handle description input with tag detection
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    const beforeCursor = value.slice(0, cursorPos);
    const tagMatch = beforeCursor.match(/#[^\s]*$/);
    if (tagMatch && tagMatch[0] === '#') {
      setShowInlineTagInput(true);
      setInlineTagValue('');
      const textarea = e.target;
      const rect = textarea.getBoundingClientRect();
      const textBeforeCursor = beforeCursor.slice(0, -1);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      const tempSpan = document.createElement('span');
      tempSpan.style.font = window.getComputedStyle(textarea).font;
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = currentLine;
      document.body.appendChild(tempSpan);
      const textWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const currentLineIndex = lines.length - 1;
      const top = rect.top + currentLineIndex * lineHeight - 40;
      const left = rect.left + textWidth;
      setInlineTagPosition({ top, left });
    } else if (tagMatch && tagMatch[0].length > 1) {
      setInlineTagValue(tagMatch[0].slice(1));
      const query = tagMatch[0].slice(1);
      handleTagSearch(query).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(suggestions.length > 0);
        setSelectedSuggestionIndex(0);
      });
    } else {
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
      setShowInlineSuggestions(false);
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag: Tag | null, isNew: boolean = false) => {
    let selectedTag: Tag;
    if (isNew && tag) {
      selectedTag = tag;
    } else if (tag) {
      selectedTag = tag;
    } else {
      return;
    }
    if (selectedTags.find(t => t.name === selectedTag.name)) {
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
      return;
    }
    if (selectedTags.length >= 5) {
      setTagError('태그는 최대 5개까지 추가할 수 있습니다.');
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
      return;
    }
    setSelectedTags(prev => [...prev, selectedTag]);
    const beforeCursor = description.slice(0, cursorPosition);
    const afterCursor = description.slice(cursorPosition);
    const tagPattern = /#[^\s]*$/;
    const newBeforeCursor = beforeCursor.replace(tagPattern, ' ');
    const newDescription = newBeforeCursor + afterCursor;
    setDescription(newDescription);
    setShowInlineTagInput(false);
    setShowTagDropdown(false);
    setInlineTagValue('');
    setCurrentTagQuery('');
    setShowInlineSuggestions(false);
    setSelectedSuggestionIndex(0);
    const newCursorPos = newBeforeCursor.length;
    setCursorPosition(newCursorPos);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Remove tag
  const removeTag = (tagId: number) => {
    setRemovingTags(prev => new Set([...prev, tagId]));
    setTimeout(() => {
      setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
      setRemovingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(tagId);
        return newSet;
      });
    }, 300);
  };

  // 태그는 한글, 영문, 숫자, 언더바(_)만 허용, 띄어쓰기/특수문자 불가
  const isValidTagName = (name: string) => {
    return /^[가-힣A-Za-z0-9_]+$/.test(name) && name.length < 30;
  };

  // Handle inline tag input changes
  const handleInlineTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInlineTagValue(value);
    if (value.length >= 1) {
      handleTagSearch(value).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(suggestions.length > 0);
        setSelectedSuggestionIndex(0);
      });
    } else {
      setShowInlineSuggestions(false);
    }
  };

  // Handle inline tag keyboard navigation
  const handleInlineTagKeyDown = (e: React.KeyboardEvent) => {
    if (showInlineSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev < tagSuggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex < tagSuggestions.length) {
          handleTagSelect(tagSuggestions[selectedSuggestionIndex]);
        } else if (inlineTagValue && isValidTagName(inlineTagValue)) {
          handleTagSelect({ id: 0, name: inlineTagValue }, true);
        }
      } else if (e.key === 'Escape') {
        setShowInlineTagInput(false);
        setInlineTagValue('');
        setShowInlineSuggestions(false);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inlineTagValue && isValidTagName(inlineTagValue)) {
          handleTagSelect({ id: 0, name: inlineTagValue }, true);
        }
      } else if (e.key === 'Escape') {
        setShowInlineTagInput(false);
        setInlineTagValue('');
      }
    }
  };

  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-gray-800'>
            {isEditMode ? '포스트 수정' : '새 포스트'}
          </h3>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-500'>
              @
              {isEditMode
                ? authorUsername || user?.username || 'username'
                : user?.username || 'username'}
            </span>
            <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]'>
              {isEditMode && authorAvatar ? (
                <img src={authorAvatar} alt='avatar' className='h-8 w-8 object-cover' />
              ) : user?.avatar ? (
                <img src={user.avatar} alt='avatar' className='h-8 w-8 object-cover' />
              ) : (
                <i className='fas fa-user text-white'></i>
              )}
            </div>
          </div>
        </div>
        <div className='mb-6'>
          <div className='relative'>
            <textarea
              placeholder='플레이리스트에 대해 이야기해주세요... #태그를 입력하면 자동완성이 나타납니다'
              maxLength={128}
              className='h-32 w-full resize-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-gray-800 focus:ring-2 focus:ring-[#4A6CF7] focus:outline-none'
              value={description}
              onChange={handleDescriptionChange}
              ref={textareaRef}
            ></textarea>
            {showInlineTagInput && (
              <div
                className='floating-tag-input fixed z-50 rounded-lg border border-gray-300 bg-white p-2 shadow-lg'
                style={{
                  top: inlineTagPosition.top,
                  left: inlineTagPosition.left,
                  width: 'fit-content',
                  minWidth: '120px',
                  maxWidth: '200px',
                }}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>#</span>
                  <input
                    type='text'
                    className='flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-[#4A6CF7] focus:outline-none'
                    placeholder='태그 입력'
                    value={inlineTagValue}
                    onChange={handleInlineTagChange}
                    onKeyDown={handleInlineTagKeyDown}
                    onBlur={() => {
                      if (inlineTagValue && isValidTagName(inlineTagValue)) {
                        handleTagSelect({ id: 0, name: inlineTagValue }, true);
                      }
                      setShowInlineTagInput(false);
                      setInlineTagValue('');
                    }}
                    autoFocus
                  />
                </div>
                {showInlineSuggestions && (
                  <div className='mt-1 max-h-32 overflow-y-auto border-t border-gray-200 pt-1'>
                    {tagSuggestions.map((tag, index) => (
                      <div
                        key={tag.id}
                        className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-100 ${
                          index === selectedSuggestionIndex ? 'bg-indigo-100' : ''
                        }`}
                        onClick={() => handleTagSelect(tag)}
                      >
                        <i className='fas fa-tag text-gray-400'></i>
                        <span>{tag.name}</span>
                      </div>
                    ))}
                    {inlineTagValue &&
                      isValidTagName(inlineTagValue) &&
                      !tagSuggestions.find(t => t.name === inlineTagValue) && (
                        <div
                          className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-100 ${
                            selectedSuggestionIndex === tagSuggestions.length ? 'bg-green-100' : ''
                          }`}
                          onClick={() => handleTagSelect({ id: 0, name: inlineTagValue }, true)}
                        >
                          <i className='fas fa-plus text-green-500'></i>
                          <span className='text-green-600'>새 태그: {inlineTagValue}</span>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-sm text-gray-500'>{selectedTags.length}/5 태그</span>
            <span className='text-sm text-gray-500'>{description.length}/128</span>
          </div>
        </div>
        {/* 태그 뱃지 표시 */}
        {selectedTags.length > 0 && (
          <div className='mb-4'>
            <div className='flex flex-wrap gap-2'>
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-sm text-indigo-800 transition-all duration-300 ease-in-out ${
                    removingTags.has(tag.id)
                      ? 'scale-95 transform opacity-0'
                      : 'scale-100 opacity-100'
                  }`}
                >
                  <span>#{tag.name}</span>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeTag(tag.id);
                    }}
                    className='ml-1 rounded-full p-1 text-indigo-500 transition-colors hover:bg-indigo-200 hover:text-indigo-700'
                    aria-label='태그 삭제'
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 고정 태그 뱃지 표시 */}
        {fixedTag && (
          <div className='mb-2 flex items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700'>
              <i className='fas fa-tag text-[#4A6CF7]'></i>
              {fixedTag.displayName || fixedTag.name}
            </span>
          </div>
        )}
        <div className='mb-6 rounded-lg bg-gray-50 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-700'>플레이리스트 미리보기</span>
            <span className='text-sm text-gray-500'>{playlist.length}곡</span>
          </div>
          <div className='mb-3 flex items-center gap-3'>
            <img
              src={playlist[0].albumCover}
              alt='Playlist cover'
              className='h-16 w-16 rounded-lg object-cover'
            />
            <div>
              <h4 className='font-medium text-gray-800'>{playlist[0].title}</h4>
              <p className='text-sm text-gray-500'>{playlist[0].artist}</p>
              <p className='text-xs text-gray-400'>외 {playlist.length - 1}곡</p>
            </div>
          </div>
          <div className='border-t border-gray-200 pt-3'>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <Clock size={14} />
              <span>생성일: 2025.01.08</span>
            </div>
          </div>
        </div>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-700'>공개 설정</span>
            <div className='flex items-center gap-2'>
              <button
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${isPublic ? 'bg-[#4A6CF7] text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setIsPublic(true)}
              >
                <Globe size={16} className='mr-2 inline-block' />
                공개
              </button>
              <button
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!isPublic ? 'bg-[#4A6CF7] text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setIsPublic(false)}
              >
                <Lock size={16} className='mr-2 inline-block' />
                비공개
              </button>
            </div>
          </div>
        </div>
        <div className='flex gap-3'>
          <button
            className='flex-1 rounded-lg bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200'
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className='flex-1 rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] py-3 font-medium text-white transition-all hover:from-[#3955CC] hover:to-[#8470FF]'
            onClick={() => {
              if (!description.trim()) {
                alert('설명을 입력해주세요!');
                return;
              }
              onSave({ description, tags: selectedTags, isPublic });
            }}
            disabled={loading}
          >
            {loading ? (
              <svg
                className='mr-2 h-4 w-4 animate-spin'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            ) : (
              '저장'
            )}
          </button>
        </div>
        {error && <div className='mt-4 text-center text-red-500'>{error}</div>}
      </div>
    </div>
  );
};

export default SavePlaylistModal;
