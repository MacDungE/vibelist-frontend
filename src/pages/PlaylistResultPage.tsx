import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from 'react-use';
// TrackRsDto 타입 import
import type { TrackRsDto } from '@/types/api';
// 필요한 API 예시 import (실제 연결 시 아래 주석 참고)
import { createPost } from '@/http/postApi';
import { suggestTags } from '@/http/tagApi';
import SavePlaylistModal from '@/components/common/SavePlaylistModal';
import DocumentTitle from '@/components/seo/DocumentTitle.tsx';

/*
  [이 페이지에서 사용할 API 목록]
  1. 플레이리스트 저장: addPlaylistToSpotify(userId, tracks)
  2. 태그 자동완성: suggestTags(q, limit)
  3. (추가 필요시) 포스트 생성 등
*/

const PlaylistResultPage: React.FC = () => {
  const location = useLocation();

  // Add error state
  const [error, setError] = useState<string | null>(null);

  // location.state에서 추천 결과, 감정, 무드 정보 받기
  const recommendations: TrackRsDto[] = location.state?.recommendations || [];
  const emotionText = location.state?.emotionText || ''; // 텍스트 모드로 입력된 감정 텍스트

  // 추천 결과가 없으면 홈으로 리다이렉트 (텍스트 모드가 아닌 경우에만)
  React.useEffect(() => {
    if (
      !location.state ||
      ((!Array.isArray(location.state.recommendations) ||
        location.state.recommendations.length === 0) &&
        !location.state.emotionText) // 텍스트 모드가 아닌 경우에만 리다이렉트
    ) {
      window.location.replace('/');
    }
  }, [location.state]);

  const selectedEmotion = location.state?.selectedEmotion || '감정 정보 없음';
  const selectedMoodChange = location.state?.selectedMoodChange || '기분 변화 정보 없음';

  // 고정 태그 생성
  // 예시: '즐거운 상태에서 차분해지기', 실제 태그: '즐거운_상태에서_차분해지기'
  function getFixedTagText(emotion: string, mood: string) {
    // 자연스러운 문장형 변환
    return `${emotion} 상태에서 ${mood}로 변화하기`;
  }
  function getFixedTagValue(emotion: string, mood: string) {
    // 띄어쓰기 대신 언더스코어로 연결
    return `${emotion}_상태에서_${mood}로_변화하기`;
  }

  // 텍스트 모드인지 차트 모드인지에 따라 고정 태그 생성
  const fixedTag = emotionText
    ? {
        id: -1,
        name: 'AI_생성',
        displayName: 'AI 생성',
        mood: selectedMoodChange,
        fixed: true,
      }
    : {
        id: -1,
        name: getFixedTagValue(selectedEmotion, selectedMoodChange),
        displayName: getFixedTagText(selectedEmotion, selectedMoodChange),
        emotion: selectedEmotion,
        mood: selectedMoodChange,
        fixed: true,
      };

  // TrackRsDto → UI용 Track 변환
  const convertTrack = (track: TrackRsDto, idx: number) => ({
    id: idx + 1,
    title: track.title,
    artist: track.artist,
    duration: msToMinSec(track.durationMs),
    albumCover: track.imageUrl,
    spotifyUrl: `https://open.spotify.com/embed/track/${track.spotifyId}`,
    order: idx + 1,
    album: track.album,
    trackId: track.trackId,
    spotifyId: track.spotifyId,
  });
  function msToMinSec(ms: number) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  // tracks: 원본 TrackRsDto[] (저장용)
  const [tracks, setTracks] = useState<TrackRsDto[]>(recommendations);
  // playlist: UI 표시용 변환 데이터
  const playlist = tracks.map(convertTrack);

  // Player state (중복 선언 제거, 한 번만 선언)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isShuffle] = useState(false);
  const [repeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Array<{ id: number; name: string }>>([]);
  const [tagSuggestions, setTagSuggestions] = useState<Array<{ id: number; name: string }>>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showInlineTagInput, setShowInlineTagInput] = useState(false);
  const [inlineTagPosition, setInlineTagPosition] = useState({ top: 0, left: 0 });
  const [inlineTagValue, setInlineTagValue] = useState('');
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Debounced tag search states
  const [debouncedInlineTagValue, setDebouncedInlineTagValue] = useState('');
  const [debouncedDescriptionTagQuery, setDebouncedDescriptionTagQuery] = useState('');

  // 상태 추가
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // Debounce inline tag input (300ms delay)
  useDebounce(
    () => {
      setDebouncedInlineTagValue(inlineTagValue);
    },
    300,
    [inlineTagValue]
  );

  // Debounce description tag query (300ms delay)
  useDebounce(
    () => {
      const beforeCursor = description.slice(0, cursorPosition);
      const tagMatch = beforeCursor.match(/#[^\s]*$/);
      if (tagMatch && tagMatch[0].length > 1) {
        const query = tagMatch[0].slice(1);
        setDebouncedDescriptionTagQuery(query);
      } else {
        setDebouncedDescriptionTagQuery('');
      }
    },
    300,
    [description, cursorPosition]
  );

  // Handle debounced inline tag search
  useEffect(() => {
    if (debouncedInlineTagValue.length >= 1) {
      handleTagSearch(debouncedInlineTagValue).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(
          suggestions.length > 0 ||
            (debouncedInlineTagValue !== '' && isValidTagName(debouncedInlineTagValue))
        );
        setSelectedSuggestionIndex(0);
      });
    } else {
      setShowInlineSuggestions(false);
    }
  }, [debouncedInlineTagValue]);

  // Handle debounced description tag search
  useEffect(() => {
    if (debouncedDescriptionTagQuery.length >= 1) {
      handleTagSearch(debouncedDescriptionTagQuery).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(
          suggestions.length > 0 ||
            (debouncedDescriptionTagQuery !== '' && isValidTagName(debouncedDescriptionTagQuery))
        );
        setSelectedSuggestionIndex(0);
      });
    } else {
      setShowInlineSuggestions(false);
    }
  }, [debouncedDescriptionTagQuery]);

  // 트랙 삭제 핸들러: playlist와 tracks 모두에서 삭제
  const handleRemoveTrack = (id: number) => {
    setTracks(prev => {
      // playlist의 id는 idx+1이므로, tracks에서 해당 idx를 찾아 삭제
      const idx = playlist.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const newTracks = prev.slice(0, idx).concat(prev.slice(idx + 1));
      // currentTrackIndex 조정
      if (idx === currentTrackIndex) {
        setCurrentTrackIndex(0);
      } else if (idx < currentTrackIndex) {
        setCurrentTrackIndex(i => Math.max(0, i - 1));
      }
      return newTracks;
    });
  };

  // 태그 자동완성 실제 API 연동 (로딩/에러 처리 추가)
  const handleTagSearch = async (query: string) => {
    if (!query) return [];
    setTagLoading(true);
    setTagError(null);
    try {
      const res = await suggestTags(query);
      setTagLoading(false);
      return res.data.data || [];
    } catch (e) {
      setTagLoading(false);
      setTagError('태그 자동완성에 실패했습니다.');
      return [];
    }
  };

  // Handle description input with tag detection
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Get cursor position
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Check for # tag input - show floating input
    const beforeCursor = value.slice(0, cursorPos);
    const tagMatch = beforeCursor.match(/#[^\s]*$/);

    if (tagMatch && tagMatch[0] === '#') {
      // Show floating tag input
      setShowInlineTagInput(true);
      setInlineTagValue('');

      // Calculate position for floating input
      const textarea = e.target;
      const rect = textarea.getBoundingClientRect();
      const textBeforeCursor = beforeCursor.slice(0, -1); // Remove the #
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      // Create a temporary span to measure text width
      const tempSpan = document.createElement('span');
      tempSpan.style.font = window.getComputedStyle(textarea).font;
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = currentLine;
      document.body.appendChild(tempSpan);

      const textWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const currentLineIndex = lines.length - 1;
      const top = rect.top + currentLineIndex * lineHeight - 40; // 40px above the line
      const left = rect.left + textWidth;

      setInlineTagPosition({ top, left });
    } else if (tagMatch && tagMatch[0].length > 1) {
      // Update floating tag value
      setInlineTagValue(tagMatch[0].slice(1));
    } else {
      setShowInlineTagInput(false);
      setShowInlineSuggestions(false);
    }
  };

  // Handle tag selection
  const handleTagSelect = async (
    tag: { id: number; name: string } | null,
    isNew: boolean = false
  ) => {
    let selectedTag: { id: number; name: string };

    if (isNew && tag) {
      // Create new tag
      selectedTag = tag;
    } else if (tag) {
      selectedTag = tag;
    } else {
      return;
    }

    // Check if tag already exists
    if (selectedTags.find(t => t.name === selectedTag.name)) {
      setShowInlineTagInput(false);
      return;
    }

    // Check limits
    if (selectedTags.length >= 5) {
      alert('태그는 최대 5개까지 추가할 수 있습니다.');
      setShowInlineTagInput(false);
      return;
    }

    // Add tag to selected tags
    setSelectedTags(prev => [...prev, selectedTag]);

    // Replace #tag with space in description
    const beforeCursor = description.slice(0, cursorPosition);
    const afterCursor = description.slice(cursorPosition);

    // Find the last #tag pattern and replace it completely
    const tagPattern = /#[^\s]*$/;
    const newBeforeCursor = beforeCursor.replace(tagPattern, ' ');
    const newDescription = newBeforeCursor + afterCursor;

    setDescription(newDescription);
    setShowInlineTagInput(false);
    setInlineTagValue('');
    setShowInlineSuggestions(false);
    setSelectedSuggestionIndex(0);

    // Update cursor position after replacement
    const newCursorPos = newBeforeCursor.length;
    setCursorPosition(newCursorPos);

    // Set cursor position in textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Validate tag name
  const isValidTagName = (name: string) => {
    return /^[가-힣A-Za-z0-9]+$/.test(name) && name.length < 30;
  };

  // Handle inline tag input changes
  const handleInlineTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInlineTagValue(value);
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
          // Select existing tag
          handleTagSelect(tagSuggestions[selectedSuggestionIndex]);
        } else if (inlineTagValue && isValidTagName(inlineTagValue)) {
          // Create new tag
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

  // Player refs

  const progressIntervalRef = useRef<number | null>(null);

  const playerCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setPlayerHeight] = useState<number | undefined>(undefined);

  // Handle player events
  useEffect(() => {
    // Cleanup function for intervals
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle track change
  useEffect(() => {
    if (playerReady && playlist[currentTrackIndex]) {
      setIsPlaying(true);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(0);
      setCurrentTime(0);
      const trackDuration = convertTimeToSeconds(playlist[currentTrackIndex].duration);
      setDuration(trackDuration);

      progressIntervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const trackDuration = convertTimeToSeconds(playlist[currentTrackIndex].duration);
          if (newTime >= trackDuration) {
            handleTrackEnd();
            return 0;
          }
          setProgress((newTime / trackDuration) * 100);
          return newTime;
        });
      }, 1000) as unknown as number;
    }
  }, [currentTrackIndex, playerReady]);

  // Handle track end
  const handleTrackEnd = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (repeatMode === 'one') {
      setProgress(0);
      setCurrentTime(0);
      startProgressTracking();
    } else {
      playNextTrack();
    }
  };

  // Start progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = window.setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        const trackDuration = convertTimeToSeconds(playlist[currentTrackIndex].duration);
        if (newTime >= trackDuration) {
          handleTrackEnd();
          return 0;
        }
        setProgress((newTime / trackDuration) * 100);
        return newTime;
      });
    }, 1000) as unknown as number;
  };

  // Play next track
  const playNextTrack = () => {
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentTrackIndex && playlist.length > 1);
      setCurrentTrackIndex(nextIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
    }
  };

  // Convert time string to seconds
  const convertTimeToSeconds = (timeStr: string) => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
  };

  // 플레이리스트 저장 실제 API 연동 (로딩/에러 처리 추가)
  const handleSavePlaylist = async ({
    description,
    tags,
    isPublic,
  }: {
    description: string;
    tags: { id: number; name: string }[];
    isPublic: boolean;
  }) => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      // 고정 태그 + 사용자 태그 조합
      const allTags = [fixedTag.name, ...tags.map(t => t.name)];

      // 텍스트 모드로 입력된 감정 텍스트가 있으면 설명에 추가
      let finalDescription = description;
      if (emotionText) {
        finalDescription = `[감정 입력]\n${emotionText}\n\n${description}`;
      }

      const postReq = {
        tracks,
        content: finalDescription,
        tags: allTags,
        isPublic,
      };
      const res = await createPost(postReq);
      setSaveLoading(false);
      setShowSaveModal(false);
      // 새 포스트 상세 페이지로 이동
      if (res.data && res.data.data) {
        // 추천 트랙 데이터/상태 지우기 (history.replaceState)
        window.history.replaceState({}, '', '/');
        setTracks([]);
        window.location.href = `/post/${res.data.data}`;
      }
    } catch (e) {
      setSaveLoading(false);
      setSaveError('플레이리스트 저장에 실패했습니다.');
    }
  };

  // Handle track selection
  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  // Simulate player ready after component mount
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        setPlayerReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    } catch (err) {
      setError(
        `Player initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, []);

  // Measure player card height on mount and resize (mobile only)
  useEffect(() => {
    try {
      function updateHeight() {
        if (window.innerWidth < 768 && playerCardRef.current) {
          setPlayerHeight(playerCardRef.current.offsetHeight);
        } else {
          setPlayerHeight(undefined);
        }
      }
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    } catch (err) {
      setError(`Height calculation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Handle backdrop click to close floating input
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      if (showInlineTagInput) {
        const target = e.target as HTMLElement;
        if (!target.closest('.floating-tag-input')) {
          setShowInlineTagInput(false);
          setInlineTagValue('');
        }
      }
    };

    if (showInlineTagInput) {
      document.addEventListener('mousedown', handleBackdropClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleBackdropClick);
    };
  }, [showInlineTagInput]);

  const { user } = useAuth();

  return (
    <div
      className='min-h-screen w-full'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <DocumentTitle title={'플레이리스트'} />
      {error && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-red-50'>
          <div className='max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h3 className='mb-2 text-lg font-semibold text-red-800'>오류가 발생했습니다</h3>
            <p className='mb-4 text-red-600'>{error}</p>
            <button
              onClick={() => setError(null)}
              className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <div className='mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-0'>
        {/* 기존 메인 컨텐츠 전체를 이 div 안에 넣기 */}
        <div className='flex min-h-0 w-full flex-1 flex-col p-4'>
          {/* Combined Player + Playlist Card */}
          <div
            className='flex h-full min-h-0 flex-col rounded-xl p-4 shadow'
            style={{ background: 'var(--surface)' }}
          >
            {/* Spotify Player */}
            <div ref={playerCardRef} className='mb-4 flex flex-col items-center md:items-stretch'>
              <iframe
                src={playlist.length > 0 ? playlist[currentTrackIndex].spotifyUrl : ''}
                title='Spotify music player'
                className='aspect-[16/10] w-full max-w-[400px] rounded-lg border-none md:aspect-[16/5] md:max-h-[220px] md:max-w-full'
                allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                loading='lazy'
                style={{ minHeight: 120 }}
              ></iframe>
            </div>
            {/* Info message for deleting tracks */}
            <div
              className='mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm'
              style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}
            >
              <i className='fas fa-info-circle' style={{ color: 'var(--primary)' }}></i>
              <span>
                원하지 않는 곡은 <b style={{ color: 'var(--primary)' }}>휴지통 버튼</b>을 눌러
                삭제할 수 있어요!
              </span>
            </div>
            {/* Playlist List */}
            <div className='flex min-h-0 flex-1 flex-col'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-medium'>플레이리스트</h3>
                <span className='text-sm text-gray-500'>{playlist.length}곡</span>
              </div>
              <div className='mb-4 flex flex-wrap gap-2'>
                {emotionText ? (
                  // 텍스트 모드로 입력된 경우
                  <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5'>
                    <i className='fas fa-comment text-[#4A6CF7]'></i>
                    <span className='text-sm text-gray-700'>{emotionText}</span>
                  </div>
                ) : (
                  // 차트 모드로 선택된 경우
                  <>
                    <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5'>
                      <i className='fas fa-smile text-[#4A6CF7]'></i>
                      <span className='text-sm text-gray-700'>{selectedEmotion}</span>
                    </div>
                    <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5'>
                      <i className='fas fa-arrow-up text-[#4A6CF7]'></i>
                      <span className='text-sm text-gray-700'>{selectedMoodChange}</span>
                    </div>
                  </>
                )}
              </div>
              <div className='scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-2'>
                {playlist.length === 0 ? (
                  <div className='py-12 text-center text-gray-400'>추천된 트랙이 없습니다.</div>
                ) : (
                  playlist.map((track, index) => (
                    <div
                      key={track.id}
                      className={`mb-2 flex items-center gap-3 rounded-lg p-2 transition-all duration-200 ${currentTrackIndex === index ? 'border border-indigo-200 bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className='relative cursor-pointer' onClick={() => selectTrack(index)}>
                        <img
                          src={track.albumCover}
                          alt={`${track.title} album cover`}
                          className='h-12 w-12 rounded-md object-cover'
                        />
                      </div>
                      <div
                        className='min-w-0 flex-1 cursor-pointer'
                        onClick={() => selectTrack(index)}
                      >
                        <h4 className='truncate font-medium'>{track.title}</h4>
                        <p className='truncate text-sm text-gray-600'>{track.artist}</p>
                      </div>
                      <span
                        className='cursor-pointer text-sm text-gray-500'
                        onClick={() => selectTrack(index)}
                      >
                        {track.duration}
                      </span>
                      <button
                        className='ml-2 rounded-full p-2 text-red-500 transition hover:bg-red-100'
                        aria-label='트랙 삭제'
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        <i className='fas fa-trash-alt'></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                className='mt-4 w-full flex-shrink-0 cursor-pointer rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] py-3 font-medium text-white transition-all duration-300 hover:shadow-lg'
                onClick={() => setShowSaveModal(true)}
                disabled={playlist.length === 0}
              >
                플레이리스트 저장하기
              </button>
            </div>
          </div>
        </div>

        {/* Save playlist modal */}
        <SavePlaylistModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          playlist={playlist}
          loading={saveLoading}
          error={saveError}
          onSave={handleSavePlaylist}
          onTagSearch={handleTagSearch}
          fixedTag={fixedTag}
          onFixedTagClick={() => {}}
          authorUsername={user?.username}
          authorAvatar={user?.avatar}
          isEditMode={false}
        />
      </div>
    </div>
  );
};

export default PlaylistResultPage;
