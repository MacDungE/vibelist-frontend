import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { TrackRsDto } from '@/types/api';

// Spotify에 Playlist 삽입
export const addPlaylistToSpotify = (tracks: TrackRsDto[]): Promise<{ data: TrackRsDto }> =>
  apiClient.post(API_ENDPOINTS.PLAYLIST.ADD, tracks);

// 개발자 로그인 (Spotify 로그인 리다이렉트)
export const loginDeveloper = () => apiClient.get(API_ENDPOINTS.PLAYLIST.LOGIN_DEV);

// 콜백 처리
export const handleCallback = (code: string): Promise<{ data: string }> =>
  apiClient.get(API_ENDPOINTS.PLAYLIST.CALLBACK, { params: { code } });
