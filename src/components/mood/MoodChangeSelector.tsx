import React from 'react';
import { MOOD_CHANGE_LABELS } from '@/constants/mood';
import { EMOTION_STATE } from '@/constants/emotion';
import type {MoodChangeOption} from "@/types/common.ts";

interface MoodChangeSelectorProps {
  selected: MoodChangeOption | null;
  onSelect: (option: MoodChangeOption) => void;
  selectedEmotion: string;
}

// 감정별 허용 mood change 옵션 매핑
const EMOTION_MOOD_OPTIONS: Record<string, MoodChangeOption[]> = {
  [EMOTION_STATE.활기찬]: ['maintain', 'calm', 'opposite'],
  [EMOTION_STATE.즐거운]: ['maintain', 'improve', 'calm', 'opposite'],
  [EMOTION_STATE.긴장된]: ['calm', 'opposite', 'improve'],
  [EMOTION_STATE.걱정되는]: ['calm', 'opposite'],
  [EMOTION_STATE.편안한]: ['maintain', 'improve', 'opposite'],
  [EMOTION_STATE.나른한]: ['maintain', 'improve', 'calm', 'opposite'],
  [EMOTION_STATE.우울한]: ['improve', 'calm', 'opposite'],
  [EMOTION_STATE.무기력한]: ['opposite', 'improve', 'calm'],
};

const MoodChangeSelector: React.FC<MoodChangeSelectorProps> = ({ selected, onSelect, selectedEmotion }) => {
  const options = EMOTION_MOOD_OPTIONS[selectedEmotion] || [];
  // 아이콘/컬러셋 매핑
  const ICONS: Record<MoodChangeOption, string> = {
    maintain: 'fas fa-equals',
    improve: 'fas fa-arrow-up',
    calm: 'fas fa-moon',
    opposite: 'fas fa-exchange-alt',
  };
  const COLORS: Record<MoodChangeOption, string> = {
    maintain: 'from-[#BFA9F2] to-[#9E8BE0]',
    improve: 'from-[#4A6CF7] to-[#9B8CFF]',
    calm: 'from-[#1DB954] to-[#4A6CF7]',
    opposite: 'from-[#FFB347] to-[#FF5E62]',
  };
  return (
    <div className="flex flex-col gap-3 w-full max-w-[400px] mx-auto px-2 sm:px-0">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`flex items-center gap-4 !rounded-button px-5 py-4 h-[72px] rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm group ${selected ? (selected === option ? 'bg-white shadow-md scale-[1.02] border border-[#4A6CF7]' : 'bg-white/50 opacity-60') : 'bg-white border border-gray-100'}`}
        >
          <span className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${COLORS[option]} text-white text-xl shadow-md`}>
            <i className={`${ICONS[option]}`}></i>
          </span>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{MOOD_CHANGE_LABELS[option]}</span>
            <span className="text-xs text-[var(--text-secondary)] leading-snug">
              {option === 'maintain' && '현재 감정과 비슷한 분위기의 음악을 추천해드립니다.'}
              {option === 'improve' && '더 긍정적인 감정으로 변화시키는 음악을 추천해드립니다.'}
              {option === 'calm' && '마음을 진정시키고 안정감을 주는 음악을 추천해드립니다.'}
              {option === 'opposite' && '현재와 대비되는 감정의 음악을 추천해드립니다.'}
            </span>
          </div>
          {selected === option && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] text-white shadow">선택됨</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MoodChangeSelector; 