import React from 'react';
import { EmotionPosition } from '@/types';

interface EmotionChartProps {
  position: EmotionPosition;
  setPosition: (pos: EmotionPosition) => void;
  isDragging: boolean;
  setIsDragging: (drag: boolean) => void;
  chartRef: React.RefObject<HTMLDivElement>;
  pointerRef: React.RefObject<HTMLDivElement>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
}

const EmotionChart: React.FC<EmotionChartProps> = ({
  position,
  setPosition,
  isDragging,
  setIsDragging,
  chartRef,
  pointerRef,
  onPointerDown,
  onPointerMove,
}) => {
  return (
    <div className="w-full max-w-[min(22rem,90vw)] sm:max-w-[min(25rem,90vw)] mx-auto">
      <div
        ref={chartRef}
        className="relative w-full max-w-[min(22rem,90vw)] sm:max-w-[min(25rem,90vw)] aspect-[1.43/1] rounded-lg shadow-md select-none mx-auto mt-2 sm:mt-4 touch-none scale-[0.92] sm:scale-100 transform-gpu"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        {/* 차트 배경 */}
        <div className="absolute inset-0 rounded-lg" style={{ border: '1px solid var(--stroke)', background: 'var(--surface-alt)' }}>
          {/* 중앙 십자선 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'var(--stroke)', opacity: 0.3 }}></div>
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'var(--stroke)', opacity: 0.3 }}></div>
          
          {/* 감정 라벨 - 상단 영역 */}
          <div className="absolute left-[25%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-base font-semibold px-3 py-1 rounded-full backdrop-blur-sm" style={{ color: 'var(--primary)' }}>
              활기참
            </span>
          </div>
          <div className="absolute right-[25%] top-[15%] transform translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-base font-semibold px-3 py-1 rounded-full backdrop-blur-sm" style={{ color: 'var(--primary-600)' }}>
              긴장
            </span>
          </div>
          
          {/* 감정 라벨 - 중상단 영역 */}
          <div className="absolute left-[25%] top-[40%] transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-base font-semibold px-3 py-1 rounded-full backdrop-blur-sm" style={{ color: 'var(--accent)' }}>
              기쁨
            </span>
          </div>
          <div className="absolute right-[25%] top-[40%] transform translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-base font-semibold text-purple-500 px-3 py-1 rounded-full backdrop-blur-sm">
              두려움
            </span>
          </div>
          
          {/* 감정 라벨 - 중하단 영역 */}
          <div className="absolute left-[25%] bottom-[40%] transform -translate-x-1/2 translate-y-1/2 text-center">
            <span className="text-base font-semibold text-green-500 px-3 py-1 rounded-full backdrop-blur-sm">
              평온함
            </span>
          </div>
          <div className="absolute right-[25%] bottom-[40%] transform translate-x-1/2 translate-y-1/2 text-center">
            <span className="text-base font-semibold text-blue-500 px-3 py-1 rounded-full backdrop-blur-sm">
              우울
            </span>
          </div>
          
          {/* 감정 라벨 - 하단 영역 */}
          <div className="absolute left-[25%] bottom-[15%] transform -translate-x-1/2 translate-y-1/2 text-center">
            <span className="text-base font-semibold text-teal-500 px-3 py-1 rounded-full backdrop-blur-sm">
              졸림
            </span>
          </div>
          <div className="absolute right-[25%] bottom-[15%] transform translate-x-1/2 translate-y-1/2 text-center">
            <span className="text-base font-semibold text-gray-500 px-3 py-1 rounded-full backdrop-blur-sm">
              무기력
            </span>
          </div>
        </div>

        {/* 영역 구분선 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 rounded-lg pointer-events-none"></div>
        
        {/* 드래그 가능한 포인터 */}
        <div
          ref={pointerRef}
          id="emotion-pointer"
          className={`absolute w-8 h-8 bg-gradient-to-r from-[#9B8CFF] to-[#6B8AFF] rounded-full shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#F7F9FC] group ${isDragging ? "scale-110" : ""}`}
          style={{
            left: `${position.x}%`,
            top: `${100 - position.y}%`,
            transition: isDragging ? "none" : "all 0.2s ease-out",
            touchAction: "none",
          }}
        >
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-700 px-3 py-1.5 rounded-full text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg backdrop-blur-sm">
            드래그하여 감정을 선택하세요
          </div>
          <div
            className={`absolute inset-[-4px] rounded-full border-2 border-[#9B8CFF] ${isDragging ? "animate-ping" : ""}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EmotionChart; 