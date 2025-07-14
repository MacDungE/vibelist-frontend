import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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

const PlaylistResultPage: React.FC = () => {
  const location = useLocation();
  
  // Add error state
  const [error, setError] = useState<string | null>(null);
  
  // Mock playlist data - API 응답 형식에 맞춤
  const [playlist, setPlaylist] = useState<Track[]>([
    { id: 1139, title: "breeze", artist: "DRWN.", album: "winterwarm", albumCover: "https://i.scdn.co/image/ab67616d0000b27309a857d20020536deb494427", spotifyUrl: "https://open.spotify.com/embed/track/1aaj0PtjLtgGlZn0I8PaFU", duration: "1:33", order: 1 },
    { id: 1209, title: "Sonata in E-Flat Major, K. C 23.04: II. Menuetto. Moderato", artist: "Wolfgang Amadeus Mozart", album: "Mozart: Sonatas for Violin and Piano", albumCover: "https://i.scdn.co/image/ab67616d0000b27324c593d487bd9258474793ce", spotifyUrl: "https://open.spotify.com/embed/track/4MRXK2SmK7kHuN72J8xrNQ", duration: "2:10", order: 2 },
    { id: 2228, title: "Crazy Tunes", artist: "Mister Ries", album: "The One", albumCover: "https://i.scdn.co/image/ab67616d0000b273a387dc9f16a218305a47ddd4", spotifyUrl: "https://open.spotify.com/embed/track/1IbtZ0uNiqsDBDzwe9qHdm", duration: "3:42", order: 3 },
    { id: 2296, title: "Three Little Sisters", artist: "The Andrews Sisters", album: "BD Music Presents The Andrews Sisters", albumCover: "https://i.scdn.co/image/ab67616d0000b273a838932b8c63a5eb17f4d5bf", spotifyUrl: "https://open.spotify.com/embed/track/6nVVenu19agwOFnsGXA1aK", duration: "2:19", order: 4 },
    { id: 2445, title: "In A Persian Market", artist: "The Three Suns", album: "Ultimate Cocktail Lounge", albumCover: "https://i.scdn.co/image/ab67616d0000b273c611fe2e9a85d0a88faf09e5", spotifyUrl: "https://open.spotify.com/embed/track/1TcTL9eBPD3PCAfg9mLRlK", duration: "2:42", order: 5 },
    { id: 4355, title: "My babe", artist: "Little Walter", album: "America, Vol. 12: Soul - Rhythm & Blues Goes to Soul", albumCover: "https://i.scdn.co/image/ab67616d0000b2731663bdf503a58dd796e3ee12", spotifyUrl: "https://open.spotify.com/embed/track/3CUURUnNGfts6hzDjDR2rR", duration: "2:40", order: 6 },
    { id: 5667, title: "Aqui, Ó! - Ao Vivo", artist: "Toninho Horta", album: "Solo (Ao Vivo)", albumCover: "https://i.scdn.co/image/ab67616d0000b273e1e61c79a2ddcf4ddd0017e1", spotifyUrl: "https://open.spotify.com/embed/track/3Xg8lEkZaF9OrqnhdRDP3A", duration: "4:09", order: 7 },
    { id: 6339, title: "Days Like This - DJ Spinna Urban Soul Dub", artist: "Shaun Escoffery", album: "Soulonica", albumCover: "https://i.scdn.co/image/ab67616d0000b27356e1819df2d2e006ff717e29", spotifyUrl: "https://open.spotify.com/embed/track/6uLdiVFXYEzK7edQZ5SvoZ", duration: "4:40", order: 8 },
    { id: 7437, title: "Io Mammeta E Tu (Remastered 2014)", artist: "Marino Marini", album: "Hits of Marino Marini", albumCover: "https://i.scdn.co/image/ab67616d0000b27320649e192ea6958e6ef61bad", spotifyUrl: "https://open.spotify.com/embed/track/3aIrWZ0oxHNzwAC7jvoldA", duration: "3:05", order: 9 },
    { id: 8261, title: "Hüseyni Nefes Pt. I", artist: "Gürsel Koçak", album: "Alevi ve Bektaşi Nefesleri Serisi 2", albumCover: "https://i.scdn.co/image/ab67616d0000b2735f2dbcb7d3da1c28a85f19a3", spotifyUrl: "https://open.spotify.com/embed/track/1ZPErVCwK1oswKiQWzw2Hz", duration: "4:01", order: 10 },
    { id: 8595, title: "十日町小唄", artist: "Akiko Kanazawa", album: "金沢明子の民謡(3) 関東甲信越、北陸、東海編", albumCover: "https://i.scdn.co/image/ab67616d0000b273dfba7eb3d965c9e5028992dc", spotifyUrl: "https://open.spotify.com/embed/track/2VaKCVrYBZBuvmM9zx8XvM", duration: "3:01", order: 11 },
    { id: 9671, title: "Le joueur de luth", artist: "Patachou", album: "Les Chansons de Patachou", albumCover: "https://i.scdn.co/image/ab67616d0000b273541c2a9413a514bf023e1905", spotifyUrl: "https://open.spotify.com/embed/track/03zDVglEi996ZoSlw4J1G6", duration: "3:02", order: 12 },
    { id: 10744, title: "Panther Rag - Original", artist: "Earl Hines & His Orchestra", album: "Earl Hines And His Orchestra Selected Hits Vol. 7", albumCover: "https://i.scdn.co/image/ab67616d0000b2730c2aba9f4d515fa6e032219f", spotifyUrl: "https://open.spotify.com/embed/track/6Al6Cd50C4CcVY0XHiNi4L", duration: "2:54", order: 13 },
    { id: 11331, title: "My Love For You (Has Turned To Hate)", artist: "Hank Williams", album: "The Complete Hank Williams", albumCover: "https://i.scdn.co/image/ab67616d0000b2738326fd3fdf926786d2b0525f", spotifyUrl: "https://open.spotify.com/embed/track/5ZRYnHO6z3eN8rEzJNrHBX", duration: "2:40", order: 14 },
    { id: 11597, title: "Donas da Putaria", artist: "MC Katia", album: "Donas da Putaria", albumCover: "https://i.scdn.co/image/ab67616d0000b27374f7d8971c9ef526e9251bed", spotifyUrl: "https://open.spotify.com/embed/track/4ZeRK5k8FrS0YFcErINKrg", duration: "3:19", order: 15 },
    { id: 11799, title: "Flow", artist: "RLLBTS", album: "Source", albumCover: "https://i.scdn.co/image/ab67616d0000b273863d808c6f1914577b1532e9", spotifyUrl: "https://open.spotify.com/embed/track/3gTLhx4z1EuqsPReYS2Dtu", duration: "1:32", order: 16 },
    { id: 12069, title: "Honeysuckle Rose", artist: "Gerry Mulligan Quartet", album: "Stormville", albumCover: "https://i.scdn.co/image/ab67616d0000b273d6f612d8db0200fda4ce0063", spotifyUrl: "https://open.spotify.com/embed/track/4AsvZWlj5ptFTh9avYRcKT", duration: "3:20", order: 17 },
    { id: 12531, title: "Children Of Dub", artist: "Barry Issac", album: "Barry Issac Showcase Series 2 - Children Of The Emperor", albumCover: "https://i.scdn.co/image/ab67616d0000b2731c76f56326c0daeef319e685", spotifyUrl: "https://open.spotify.com/embed/track/5peNczTkWkzprEXRtirYBk", duration: "4:14", order: 18 },
    { id: 12692, title: "Tor Peekai", artist: "Farzana", album: "Shna Khaloona", albumCover: "https://i.scdn.co/image/ab67616d0000b2737b0ce10def8efa01d37c0baa", spotifyUrl: "https://open.spotify.com/embed/track/0l2Ea1r99kEBB1cqHAQxoX", duration: "6:10", order: 19 },
    { id: 13700, title: "You Made it Right", artist: "The Ozark Mountain Daredevils", album: "Greatest Hits", albumCover: "https://i.scdn.co/image/ab67616d0000b273b089716b97e279d3eabe8d26", spotifyUrl: "https://open.spotify.com/embed/track/1wr0OrcmJI1AUL09TFS4P5", duration: "3:56", order: 20 },
  ]);

  // Player state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isShuffle] = useState(false);
  const [repeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [, setProgress] = useState(0);
  const [, setCurrentTime] = useState(0);
  const [, setDuration] = useState(0);
  useState(80);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [playlistName] = useState("내 감정 플레이리스트");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<Array<{id: number, name: string}>>([]);
  const [tagSuggestions, setTagSuggestions] = useState<Array<{id: number, name: string}>>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [currentTagQuery, setCurrentTagQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [removingTags, setRemovingTags] = useState<Set<number>>(new Set());
  const [showInlineTagInput, setShowInlineTagInput] = useState(false);
  const [inlineTagPosition, setInlineTagPosition] = useState({ top: 0, left: 0 });
  const [inlineTagValue, setInlineTagValue] = useState("");
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Mock API for tag search
  const searchTags = async (query: string) => {
    // Simulate API call
    const mockTags = [
      { id: 1, name: 'Chill' },
      { id: 2, name: 'Lofi' },
      { id: 3, name: '감성' },
      { id: 4, name: 'Workout' },
      { id: 5, name: 'Energy' },
      { id: 6, name: 'Pop' },
      { id: 7, name: 'Jazz' },
      { id: 8, name: 'Rainy' },
      { id: 9, name: 'Nature' },
      { id: 10, name: 'Healing' },
      { id: 11, name: 'Ambient' },
      { id: 12, name: 'K-POP' },
      { id: 13, name: '90s' },
      { id: 14, name: 'Retro' },
    ];
    
    return mockTags.filter(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Create new tag API simulation
  const createTag = async (name: string) => {
    // Simulate API call
    return { id: Date.now(), name };
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
      setInlineTagValue("");
      
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
      const top = rect.top + (currentLineIndex * lineHeight) - 40; // 40px above the line
      const left = rect.left + textWidth;
      
      setInlineTagPosition({ top, left });
    } else if (tagMatch && tagMatch[0].length > 1) {
      // Update floating tag value
      setInlineTagValue(tagMatch[0].slice(1));
      
      // Search for matching tags
      const query = tagMatch[0].slice(1);
      searchTags(query).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(suggestions.length > 0 || (query !== '' && isValidTagName(query)));
        setSelectedSuggestionIndex(0);
      });
    } else {
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
      setShowInlineSuggestions(false);
    }
  };

  // Handle tag selection
  const handleTagSelect = async (tag: {id: number, name: string} | null, isNew: boolean = false) => {
    let selectedTag: {id: number, name: string};
    
    if (isNew && tag) {
      // Create new tag
      selectedTag = await createTag(tag.name);
    } else if (tag) {
      selectedTag = tag;
    } else {
      return;
    }
    
    // Check if tag already exists
    if (selectedTags.find(t => t.name === selectedTag.name)) {
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
      return;
    }
    
    // Check limits
    if (selectedTags.length >= 5) {
      alert('태그는 최대 5개까지 추가할 수 있습니다.');
      setShowInlineTagInput(false);
      setShowTagDropdown(false);
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
    setShowTagDropdown(false);
    setInlineTagValue("");
    setCurrentTagQuery("");
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

  // Handle keyboard navigation in tag dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showTagDropdown) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (tagSuggestions.length > 0) {
          handleTagSelect(tagSuggestions[0]);
        } else if (currentTagQuery && isValidTagName(currentTagQuery)) {
          // Create new tag
          handleTagSelect({ id: 0, name: currentTagQuery }, true);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowTagDropdown(false);
      }
    }
    
    // Handle inline tag input
    if (showInlineTagInput) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowInlineTagInput(false);
        setInlineTagValue("");
      }
    }
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
    }, 300); // Animation duration
  };

  // Validate tag name
  const isValidTagName = (name: string) => {
    return /^[가-힣A-Za-z0-9]+$/.test(name) && name.length < 30;
  };

  // Handle inline tag input changes
  const handleInlineTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInlineTagValue(value);
    
    if (value.length >= 1) {
      // Search for matching tags
      searchTags(value).then(suggestions => {
        setTagSuggestions(suggestions);
        setShowInlineSuggestions(suggestions.length > 0 || (value !== '' && isValidTagName(value)));
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
        setSelectedSuggestionIndex(prev => 
          prev < tagSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
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
        setInlineTagValue("");
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
        setInlineTagValue("");
      }
    }
  };

  // Player refs

  const progressIntervalRef = useRef<number | null>(null);

  const playerCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setPlayerHeight] = useState<number | undefined>(undefined);

  // Emotion and mood state from location state
  const [selectedEmotion] = useState(location.state?.selectedEmotion || "즐거운 상태");
  const [selectedMoodChange] = useState(location.state?.selectedMoodChange || "기분 올리기");

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
        setCurrentTime((prev) => {
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
    if (repeatMode === "one") {
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
      setCurrentTime((prev) => {
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

  // Play/pause toggle
  // const _togglePlayPause = () => {
  //   setIsPlaying(!isPlaying);
  //   if (!isPlaying) {
  //     startProgressTracking();
  //   } else if (progressIntervalRef.current) {
  //     clearInterval(progressIntervalRef.current);
  //   }
  // };

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

  // Play previous track
  // const _playPrevTrack = () => {
  //   if (currentTime > 3) {
  //     setCurrentTime(0);
  //     setProgress(0);
  //   } else {
  //     const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  //     setCurrentTrackIndex(prevIndex);
  //   }
  // };

  // Toggle shuffle


  // Toggle repeat mode
  // const _toggleRepeat = () => {
  //   if (repeatMode === "none") {
  //     setRepeatMode("all");
  //   } else if (repeatMode === "all") {
  //     setRepeatMode("one");
  //   } else {
  //     setRepeatMode("none");
  //   }
  // };

  // Format time
  // const _formatTime = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = Math.floor(seconds % 60);
  //   return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  // };

  // Convert time string to seconds
  const convertTimeToSeconds = (timeStr: string) => {
    const [mins, secs] = timeStr.split(":").map(Number);
    return mins * 60 + secs;
  };

  // Handle progress bar click
  // const _handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (!playerReady) return;
  //   const progressBar = e.currentTarget;
  //   const rect = progressBar.getBoundingClientRect();
  //   const clickPosition = (e.clientX - rect.left) / rect.width;
  //   const newTime = clickPosition * convertTimeToSeconds(playlist[currentTrackIndex].duration);
  //   setCurrentTime(newTime);
  //   setProgress(clickPosition * 100);
  // };

  // Handle volume change
  // const _handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newVolume = parseInt(e.target.value);
  //   setVolume(newVolume);
  // };

  // Save playlist
  const handleSavePlaylist = () => {
    // Save playlist logic here
    console.log('Saving playlist with data:', {
      playlist,
      selectedEmotion,
      selectedMoodChange,
      description,
      selectedTags,
      isPublic,
      playlistName
    });
    
    // Simulate API call
    setTimeout(() => {
      alert('플레이리스트가 저장되었습니다!');
      setShowSaveModal(false);
    }, 1000);
  };

  // Handle track selection
  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  // Remove track handler
  const handleRemoveTrack = (id: number) => {
    setPlaylist((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const newList = prev.filter((t) => t.id !== id);
      // If current track is deleted, move to next or previous
      if (idx === currentTrackIndex) {
        if (newList.length === 0) {
          setCurrentTrackIndex(0);
        } else if (idx >= newList.length) {
          setCurrentTrackIndex(newList.length - 1);
        }
      } else if (idx < currentTrackIndex) {
        setCurrentTrackIndex((i) => Math.max(0, i - 1));
      }
      return newList;
    });
  };

  // Simulate player ready after component mount
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        setPlayerReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    } catch (err) {
      setError(`Player initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          setInlineTagValue("");
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

  return (
    <div className="min-h-screen w-full font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {error && (
        <div className="fixed inset-0 bg-red-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full max-w-[600px] mx-auto px-0 min-h-screen">
        {/* 기존 메인 컨텐츠 전체를 이 div 안에 넣기 */}
        <div className="w-full flex-1 flex flex-col p-4 min-h-0">
          {/* Combined Player + Playlist Card */}
          <div className="rounded-xl shadow p-4 flex flex-col h-full min-h-0" style={{ background: 'var(--surface)' }}>
            {/* Spotify Player */}
            <div ref={playerCardRef} className="flex flex-col items-center md:items-stretch mb-4">
              <iframe
                src={playlist.length > 0 ? playlist[currentTrackIndex].spotifyUrl : ''}
                title="Spotify music player"
                className="w-full max-w-[400px] md:max-w-full aspect-[16/10] md:aspect-[16/5] md:max-h-[220px] rounded-lg border-none"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ minHeight: 120 }}
              ></iframe>
            </div>
            {/* Info message for deleting tracks */}
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--surface-alt)', color: 'var(--text-secondary)' }}>
              <i className="fas fa-info-circle" style={{ color: 'var(--primary)' }}></i>
              <span>원하지 않는 곡은 <b style={{ color: 'var(--primary)' }}>휴지통 버튼</b>을 눌러 삭제할 수 있어요!</span>
            </div>
            {/* Playlist List */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">플레이리스트</h3>
                <span className="text-sm text-gray-500">{playlist.length}곡</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <i className="fas fa-smile text-[#4A6CF7]"></i>
                  <span className="text-sm text-gray-700">{selectedEmotion}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <i className="fas fa-arrow-up text-[#4A6CF7]"></i>
                  <span className="text-sm text-gray-700">{selectedMoodChange}</span>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-2 rounded-lg mb-2 transition-all duration-200 ${currentTrackIndex === index ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative cursor-pointer" onClick={() => selectTrack(index)}>
                      <img
                        src={track.albumCover}
                        alt={`${track.title} album cover`}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectTrack(index)}>
                      <h4 className="font-medium truncate">{track.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                    </div>
                    <span className="text-sm text-gray-500 cursor-pointer" onClick={() => selectTrack(index)}>
                      {track.duration}
                    </span>
                    <button
                      className="ml-2 p-2 rounded-full hover:bg-red-100 text-red-500 transition"
                      aria-label="트랙 삭제"
                      onClick={() => handleRemoveTrack(track.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 w-full py-3 bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] rounded-lg font-medium hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0 text-white"
                onClick={() => setShowSaveModal(true)}
              >
                플레이리스트 저장하기
              </button>
            </div>
          </div>
        </div>

        {/* Save playlist modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">새 포스트</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">@username</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] flex items-center justify-center">
                    <i className="fas fa-user text-white"></i>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="relative">
                  <textarea
                    placeholder="플레이리스트에 대해 이야기해주세요... #태그를 입력하면 자동완성이 나타납니다"
                    maxLength={128}
                    className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] resize-none text-gray-800 bg-transparent"
                    value={description}
                    onChange={handleDescriptionChange}
                    onKeyDown={handleKeyDown}
                    ref={textareaRef}
                  ></textarea>
                  {showInlineTagInput && (
                    <div
                      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 floating-tag-input"
                      style={{
                        top: inlineTagPosition.top,
                        left: inlineTagPosition.left,
                        width: 'fit-content',
                        minWidth: '120px',
                        maxWidth: '200px',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">#</span>
                        <input
                          type="text"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4A6CF7] text-sm"
                          placeholder="태그 입력"
                          value={inlineTagValue}
                          onChange={handleInlineTagChange}
                          onKeyDown={handleInlineTagKeyDown}
                          onBlur={() => {
                            if (inlineTagValue && isValidTagName(inlineTagValue)) {
                              handleTagSelect({ id: 0, name: inlineTagValue }, true);
                            }
                            setShowInlineTagInput(false);
                            setInlineTagValue("");
                          }}
                          autoFocus
                        />
                      </div>
                      {showInlineSuggestions && (
                        <div className="mt-1 max-h-32 overflow-y-auto border-t border-gray-200 pt-1">
                          {tagSuggestions.map((tag, index) => (
                            <div
                              key={tag.id}
                              className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-xs ${
                                index === selectedSuggestionIndex ? 'bg-indigo-100' : ''
                              }`}
                              onClick={() => handleTagSelect(tag)}
                            >
                              <i className="fas fa-tag text-gray-400"></i>
                              <span>{tag.name}</span>
                            </div>
                          ))}
                          {inlineTagValue && isValidTagName(inlineTagValue) && !tagSuggestions.find(t => t.name === inlineTagValue) && (
                            <div
                              className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded text-xs ${
                                selectedSuggestionIndex === tagSuggestions.length ? 'bg-green-100' : ''
                              }`}
                              onClick={() => handleTagSelect({ id: 0, name: inlineTagValue }, true)}
                            >
                              <i className="fas fa-plus text-green-500"></i>
                              <span className="text-green-600">새 태그: {inlineTagValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {selectedTags.length}/5 태그
                  </span>
                  <span className="text-sm text-gray-500">
                    {description.length}/128
                  </span>
                </div>
              </div>
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <div
                        key={tag.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 rounded-full text-sm text-indigo-800 transition-all duration-300 ease-in-out ${
                          removingTags.has(tag.id) 
                            ? 'opacity-0 scale-95 transform' 
                            : 'opacity-100 scale-100'
                        }`}
                      >
                        <span>#{tag.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                          className="ml-1 text-indigo-500 hover:text-indigo-700 transition-colors p-1 rounded-full hover:bg-indigo-200"
                          aria-label="태그 삭제"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    플레이리스트 미리보기
                  </span>
                  <span className="text-sm text-gray-500">
                    {playlist.length}곡
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={playlist[0].albumCover}
                    alt="Playlist cover"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {playlist[0].title}
                    </h4>
                    <p className="text-sm text-gray-500">{playlist[0].artist}</p>
                    <p className="text-xs text-gray-400">
                      외 {playlist.length - 1}곡
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                      <div
                        key={tag.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 rounded-full text-xs text-indigo-800 transition-all duration-300 ease-in-out ${
                          removingTags.has(tag.id) 
                            ? 'opacity-0 scale-95 transform' 
                            : 'opacity-100 scale-100'
                        }`}
                      >
                        <span>#{tag.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                          className="ml-1 text-indigo-500 hover:text-indigo-700 transition-colors p-0.5 rounded-full hover:bg-indigo-200"
                          aria-label="태그 삭제"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                    {selectedTags.length === 0 && (
                      <span className="text-xs text-gray-400">
                        태그를 추가해보세요
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="far fa-clock"></i>
                    <span>생성일: 2025.01.08</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    공개 설정
                  </span>
                  <div className="flex gap-2 items-center">
                    <button
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isPublic ? "bg-[#4A6CF7] text-white" : "bg-gray-100 text-gray-600"}`}
                      onClick={() => setIsPublic(true)}
                    >
                      <i className="fas fa-globe-asia mr-2"></i>공개
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!isPublic ? "bg-[#4A6CF7] text-white" : "bg-gray-100 text-gray-600"}`}
                      onClick={() => setIsPublic(false)}
                    >
                      <i className="fas fa-lock mr-2"></i>비공개
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  onClick={() => setShowSaveModal(false)}
                >
                  취소
                </button>
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] hover:from-[#3955CC] hover:to-[#8470FF] rounded-lg text-white font-medium transition-all"
                  onClick={handleSavePlaylist}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistResultPage; 