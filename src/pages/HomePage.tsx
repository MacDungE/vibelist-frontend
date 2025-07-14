import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import StepCard from '@/components/common/StepCard';
import EmotionChart from '@/components/emotion/EmotionChart';
import MoodChangeSelector from '@/components/mood/MoodChangeSelector';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/common/LoginModal';
import { EMOTION_STATE } from '@/constants/emotion';

import type { EmotionPosition, MoodChangeOption } from '@/types/common.ts';

const initialPosition: EmotionPosition = { x: 50, y: 50 };

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Global state
  const [activeStep, setActiveStep] = useState(1);
  const [position, setPosition] = useState<EmotionPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMoodChange, setSelectedMoodChange] = useState<MoodChangeOption | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [expandedCards, setExpandedCards] = useState<number[]>([1]);

  const chartRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number>(0);

  // Global pointer up handler
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Update pointer position
  const updatePointerPosition = (clientX: number, clientY: number) => {
    if (!chartRef.current || !pointerRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, (1 - (clientY - rect.top) / rect.height) * 100));
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      if (pointerRef.current) {
        pointerRef.current.style.left = `${x}%`;
        pointerRef.current.style.top = `${100 - y}%`;
      }
      setPosition({ x, y });
    });
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!chartRef.current || !pointerRef.current) return;
    setIsDragging(true);
    pointerRef.current.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    updatePointerPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePointerPosition(e.clientX, e.clientY);
  };

  // Mood change selection handler
  const handleMoodChangeSelect = (option: MoodChangeOption) => {
    setSelectedMoodChange(option);
    // Visual feedback animation
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className =
      'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-green-200 z-50 flex items-center gap-2 transition-all duration-300';
    feedbackDiv.innerHTML = `<i class="fas fa-check-circle text-green-500"></i> ${option === 'maintain' ? '기분 유지하기' : option === 'improve' ? '기분 올리기' : option === 'calm' ? '차분해지기' : '반대 기분'} 선택됨`;
    // Remove existing feedback if present
    const existingFeedback = document.getElementById('mood-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    feedbackDiv.id = 'mood-feedback';
    document.body.appendChild(feedbackDiv);
    setTimeout(() => {
      feedbackDiv.style.opacity = '0';
      setTimeout(() => feedbackDiv.remove(), 300);
    }, 2000);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Guide animation effect
  useEffect(() => {
    if (showGuide) {
      const guideAnimation = () => {
        const pointer = document.getElementById('emotion-pointer');
        if (pointer) {
          pointer.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
          pointer.style.left = '75%';
          pointer.style.top = '25%';
          setTimeout(() => {
            pointer.style.left = '50%';
            pointer.style.top = '50%';
          }, 2000);
          setTimeout(() => {
            setShowGuide(false);
          }, 3500);
        }
      };
      const timer = setTimeout(guideAnimation, 1000);
      return () => clearTimeout(timer);
    }
  }, [showGuide]);

  // Get emotion state
  const getEmotionState = (x: number, y: number): string => {
    if (y >= 75) {
      if (x < 50) return EMOTION_STATE.활기찬;
      return EMOTION_STATE.긴장된;
    }
    if (y >= 50) {
      if (x < 50) return EMOTION_STATE.즐거운;
      return EMOTION_STATE.걱정되는;
    }
    if (y >= 25) {
      if (x < 50) return EMOTION_STATE.편안한;
      return EMOTION_STATE.우울한;
    }
    if (x < 50) return EMOTION_STATE.나른한;
    return EMOTION_STATE.무기력한;
  };

  // Card expansion handlers
  const toggleCard = (cardIndex: number) => {
    if (expandedCards.includes(cardIndex)) {
      // If it's already expanded, only allow collapsing if it's not the active step
      if (cardIndex !== activeStep) {
        setExpandedCards(expandedCards.filter(index => index !== cardIndex));
      }
    } else {
      // When expanding a previous step, collapse all steps after it
      if (cardIndex < activeStep) {
        setExpandedCards([cardIndex]);
        setActiveStep(cardIndex);
      } else {
        setExpandedCards([...expandedCards, cardIndex]);
      }
    }
  };

  // Navigation handlers
  const goToStep = (step: number) => {
    if (step === 2 && position.x === 50 && position.y === 50) {
      // Show warning if user hasn't moved the emotion point
      const warningDiv = document.createElement('div');
      warningDiv.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-red-200 z-50 flex items-center gap-2';
      warningDiv.innerHTML =
        '<i class="fas fa-exclamation-circle text-red-500"></i> 감정을 선택해주세요';
      document.body.appendChild(warningDiv);
      setTimeout(() => {
        warningDiv.remove();
      }, 2000);
      return;
    }
    // Add transition animation
    const currentCard = document.querySelector(`[data-step="${activeStep}"]`);
    const nextCard = document.querySelector(`[data-step="${step}"]`);
    if (currentCard && nextCard) {
      currentCard.classList.add('animate-slideOut');
      nextCard.classList.add('animate-slideIn');
      setTimeout(() => {
        currentCard.classList.remove('animate-slideOut');
        nextCard.classList.remove('animate-slideIn');
      }, 500);
    }
    setActiveStep(step);
    // Only expand the current step card
    setExpandedCards([step]);
    if (step === 2 && firstButtonRef.current) {
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 500);
    }
  };

  // Get summary content based on user selections
  const getEmotionSummary = () => {
    if (position.x === 50 && position.y === 50) return '감정을 선택하지 않음';
    return getEmotionState(position.x, position.y);
  };

  const getMoodChangeSummary = () => {
    if (!selectedMoodChange) return '선택하지 않음';
    const moodChangeMap: { [key: string]: string } = {
      maintain: '기분 유지하기',
      improve: '기분 올리기',
      calm: '차분해지기',
      opposite: '반대 기분',
    };
    return moodChangeMap[selectedMoodChange] || '선택하지 않음';
  };

  // Handle create playlist
  const handleCreatePlaylist = () => {
    if (!selectedMoodChange) {
      const toast = document.createElement('div');
      toast.id = 'mood-change-toast';
      toast.className =
        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-red-200 z-50 flex items-center gap-2 transition-opacity duration-300';
      toast.innerHTML =
        '<i class="fas fa-exclamation-circle text-red-500"></i> 기분 변화 옵션을 먼저 선택해주세요';

      const existingToast = document.getElementById('mood-change-toast');
      if (existingToast) {
        existingToast.remove();
      }
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
      return;
    }

    // 로그인 체크
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // 플레이리스트 결과 페이지로 이동
    navigate('/playlist-result', {
      state: {
        selectedEmotion: getEmotionState(position.x, position.y),
        selectedMoodChange: getMoodChangeSummary(),
      },
    });
  };

  return (
    <div
      className='w-full font-sans'
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className='mx-auto flex w-full max-w-[600px] flex-col px-0'>
        {/* 메인 컨텐츠 */}
        <div className='flex w-full flex-1 flex-col items-center justify-center' id='main-content'>
          {/* Step 1 - 감정 선택 */}
          <StepCard
            step={1}
            title='감정 선택'
            isActive={activeStep === 1}
            isExpanded={expandedCards.includes(1)}
            onToggle={() => toggleCard(1)}
            summaryContent={getEmotionSummary()}
            data-step='1'
          >
            <div className='scale-[0.85] transform-gpu text-center sm:scale-100'>
              <h2 className='mb-2 text-lg text-gray-700 sm:mb-3'>지금 당신의 기분은 어떤가요?</h2>
              <p className='mb-2 text-2xl text-gray-700 sm:mb-4'>
                <span className='font-semibold text-indigo-600'>
                  {position.x === 50 && position.y === 50
                    ? '감정을 선택해주세요'
                    : getEmotionState(position.x, position.y)}
                </span>
              </p>
            </div>
            <EmotionChart
              position={position}
              setPosition={setPosition}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              chartRef={chartRef}
              pointerRef={pointerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            />
            <div className='mt-8 flex justify-center'>
              <button
                onClick={() => {
                  if (position.x === 50 && position.y === 50) {
                    const warningDiv = document.createElement('div');
                    warningDiv.className =
                      'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-red-200 z-50 flex items-center gap-2';
                    warningDiv.innerHTML =
                      '<i class="fas fa-exclamation-circle text-red-500"></i> 감정을 선택해주세요';
                    document.body.appendChild(warningDiv);
                    setTimeout(() => {
                      warningDiv.remove();
                    }, 2000);
                    return;
                  }
                  goToStep(2);
                  setExpandedCards([2]);
                }}
                className='!rounded-button group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] px-10 py-4 font-medium whitespace-nowrap text-[#F7F9FC] shadow-md transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg'
              >
                다음
              </button>
            </div>
          </StepCard>

          {/* Step 2 - 기분 변화 선택 */}
          {(activeStep >= 2 || activeStep === 1) && (
            <StepCard
              step={2}
              title='기분 변화 선택'
              isActive={activeStep === 2}
              isExpanded={expandedCards.includes(2)}
              onToggle={() => {
                if (activeStep >= 2) {
                  toggleCard(2);
                }
              }}
              summaryContent={getMoodChangeSummary()}
              data-step='2'
            >
              <div className='mb-4 flex flex-col items-center sm:mb-6'>
                <h3 className='mb-2 text-lg font-medium text-gray-800 sm:text-xl md:text-2xl'>
                  이 기분을 어떻게 하고 싶으신가요?
                </h3>
                <p className='text-center text-xs text-gray-600 sm:text-sm md:text-base'>
                  아래 옵션 중에서 원하시는 방향을 선택해주세요
                </p>
              </div>
              <MoodChangeSelector
                selected={selectedMoodChange}
                onSelect={handleMoodChangeSelect}
                selectedEmotion={getEmotionState(position.x, position.y)}
              />
              <div className='mt-6 flex w-full flex-col justify-center gap-4 sm:mt-8 sm:flex-row sm:gap-6'>
                <button
                  onClick={() => goToStep(1)}
                  className='!rounded-button flex cursor-pointer items-center gap-2 px-8 py-4 font-medium whitespace-nowrap text-gray-600 transition-all duration-300 hover:translate-y-[-3px] hover:text-indigo-600'
                >
                  <i className='fas fa-arrow-left'></i>
                  이전
                </button>
                <button
                  onClick={() => {
                    if (!selectedMoodChange) {
                      const toast = document.createElement('div');
                      toast.id = 'mood-change-toast';
                      toast.className =
                        'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-red-200 z-50 flex items-center gap-2 transition-opacity duration-300';
                      toast.innerHTML =
                        '<i class="fas fa-exclamation-circle text-red-500"></i> 기분 변화 옵션을 먼저 선택해주세요';

                      const existingToast = document.getElementById('mood-change-toast');
                      if (existingToast) {
                        existingToast.remove();
                      }
                      document.body.appendChild(toast);
                      setTimeout(() => {
                        toast.style.opacity = '0';
                        setTimeout(() => toast.remove(), 300);
                      }, 2000);
                      return;
                    }
                    handleCreatePlaylist();
                  }}
                  className={`!rounded-button group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] px-10 py-4 font-medium whitespace-nowrap text-[#F7F9FC] shadow-md transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg ${!selectedMoodChange ? 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none' : ''}`}
                >
                  <span className='relative z-10'>플레이리스트 만들기</span>
                  <i className='fas fa-music relative z-10 ml-1'></i>
                  <div
                    className={`absolute inset-0 -translate-x-full skew-x-12 bg-white/10 ${selectedMoodChange ? 'group-hover:animate-shine' : ''}`}
                  ></div>
                </button>
              </div>
            </StepCard>
          )}
        </div>
      </div>
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message='플레이리스트를 저장하려면 로그인이 필요합니다.'
      />
    </div>
  );
};

export default HomePage;
