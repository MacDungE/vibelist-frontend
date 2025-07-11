import React from 'react';

interface StepCardProps {
  step: number;
  title: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summaryContent?: React.ReactNode;
  [key: string]: any;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  isActive,
  isExpanded,
  onToggle,
  children,
  summaryContent,
  ...props
}) => (
  <div
    className={`w-full max-w-[1000px] mx-auto px-6 mb-4 transition-all duration-500 ${isActive ? "opacity-100" : "opacity-90"}`}
    {...props}
  >
    <div className="w-full rounded-2xl relative overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
      {/* Accent neon border */}
      <div
        className="absolute inset-0 border border-transparent rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(180deg, var(--primary), var(--primary-600))', padding: '1px', margin: '-1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
      ></div>
      
      {/* Card header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${isActive ? "bg-gradient-to-r from-[#4A6CF7]/10 to-[#9B8CFF]/10" : ""}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF]" : "bg-white/20"}`}
          >
            <span className="text-sm font-medium">{step}</span>
          </div>
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        </div>
        {!isExpanded && summaryContent && (
          <div className="flex-1 ml-4 text-sm text-gray-600 truncate">
            {summaryContent}
          </div>
        )}
        <div className="flex items-center">
          {isActive && (
            <div className="mr-2 px-2 py-1 bg-gradient-to-r from-[#4A6CF7] to-[#9B8CFF] rounded-full text-white text-xs">
              현재 단계
            </div>
          )}
          <i
            className={`fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`}
          ></i>
        </div>
      </div>
      
      {/* Card content */}
      <div
        className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-6 pt-2">{children}</div>
      </div>
    </div>
  </div>
);

export default StepCard; 