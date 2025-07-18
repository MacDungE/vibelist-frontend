import { useMutation } from '@tanstack/react-query';
import * as playlistApi from '@/http/playlistApi';
import type { TrackRsDto } from '@/types/api';

// Spotify에 Playlist 삽입
export const useAddPlaylistToSpotify = () => {
  return useMutation({
    mutationFn: (tracks: TrackRsDto[]) => playlistApi.addPlaylistToSpotify(tracks),
  });
};

// 개발자 로그인 (Spotify 로그인 리다이렉트)
export const useLoginDeveloper = () => {
  return useMutation({
    mutationFn: playlistApi.loginDeveloper,
  });
};

// 콜백 처리
export const useHandleCallback = () => {
  return useMutation({
    mutationFn: (code: string) => playlistApi.handleCallback(code),
  });
};
