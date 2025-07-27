import React from 'react';
import { X } from 'lucide-react';

interface SpotifyPlayerModalProps {
  uri: string | null;
  onClose: () => void;
}

const getSpotifyEmbedUrl = (uri: string) => {
  // Accepts uri like 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M'
  // or url like 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  if (!uri) return '';
  if (uri.startsWith('spotify:')) {
    const parts = uri.split(':');
    if (parts[1] === 'playlist' && parts[2]) {
      return `https://open.spotify.com/embed/playlist/${parts[2]}`;
    }
    // Add support for album, track, etc. if needed
  } else if (uri.includes('open.spotify.com/playlist/')) {
    return uri.replace('open.spotify.com/playlist', 'open.spotify.com/embed/playlist');
  }
  return uri;
};

const SpotifyPlayerModal: React.FC<SpotifyPlayerModalProps> = ({ uri, onClose }) => {
  if (!uri) return null;
  const embedUrl = getSpotifyEmbedUrl(uri);
  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60'>
      <div className='relative flex w-full max-w-lg flex-col items-center rounded-2xl bg-white p-4 pt-4 shadow-xl'>
        <div className={'mb-2 flex w-full justify-end'}>
          <button
            className='cursor-pointer text-2xl text-gray-500 hover:text-gray-800'
            onClick={onClose}
            aria-label='닫기'
          >
            <X />
          </button>
        </div>
        <iframe
          src={embedUrl}
          width='100%'
          height='380'
          frameBorder='0'
          allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
          allowFullScreen
          title='Spotify Player'
          className='w-full rounded-xl'
        ></iframe>
      </div>
    </div>
  );
};

export default SpotifyPlayerModal;
