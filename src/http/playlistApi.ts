import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { TrackRsDto, RsDataObject } from '@/types/api';

// Spotify에 Playlist 삽입
export const addPlaylistToSpotify = (userId: number, tracks: TrackRsDto[]): Promise<{ data: RsDataObject }> =>
  apiClient.post(API_ENDPOINTS.PLAYLIST.ADD, tracks, {
    params: { userId }
  });

// 개발자 로그인 (Spotify 로그인 리다이렉트)
export const loginDeveloper = () => apiClient.get(API_ENDPOINTS.PLAYLIST.LOGIN_DEV);

// 콜백 처리
export const handleCallback = (code: string): Promise<{ data: string }> =>
  apiClient.get(API_ENDPOINTS.PLAYLIST.CALLBACK, { params: { code } });
