import React from 'react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl p-4 max-w-lg w-full relative flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
          aria-label="닫기"
        >
          &times;
        </button>
        <iframe
          src={embedUrl}
          width="100%"
          height="380"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title="Spotify Player"
          className="rounded-xl w-full"
        ></iframe>
      </div>
    </div>
  );
};

export default SpotifyPlayerModal; 