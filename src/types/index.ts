export interface EmotionPosition {
  x: number;
  y: number;
}

export type MoodChangeOption = 'maintain' | 'improve' | 'calm' | 'opposite';

export interface Comment {
  id: number;
  postId: number;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
} 