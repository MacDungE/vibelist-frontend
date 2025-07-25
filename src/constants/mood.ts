// 기분 변화 옵션 상수
export const MOOD_CHANGE_OPTION = {
  maintain: "maintain",
  improve: "improve", 
  calm: "calm",
  opposite: "opposite",
} as const;

// 기분 변화 라벨 매핑 (기존)
export const MOOD_CHANGE_LABELS = {
  maintain: "기분 유지하기",
  improve: "기분 올리기",
  calm: "차분해지기",
  opposite: "반대 기분",
} as const; 