import apiClient from './client';
import type { TrackRsDto, RsDataObject } from '@/types/api';

// API 엔드포인트
const ENDPOINTS = {
  BASE: '/v1/playlist',
  ADD: '/v1/playlist/add',
  LOGIN_DEV: '/v1/playlist/login-dev',
  CALLBACK: '/v1/playlist/callback',
};

// Spotify에 Playlist 삽입
export const addPlaylistToSpotify = (userId: number, tracks: TrackRsDto[]): Promise<{ data: RsDataObject }> =>
  apiClient.post(ENDPOINTS.ADD, tracks, {
    params: { userId }
  });

// 개발자 로그인 (Spotify 로그인 리다이렉트)
export const loginDeveloper = () => apiClient.get(ENDPOINTS.LOGIN_DEV);

// 콜백 처리
export const handleCallback = (code: string): Promise<{ data: string }> =>
  apiClient.get(ENDPOINTS.CALLBACK, { params: { code } });
