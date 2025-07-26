/**
 * 이미지 URL 상수
 */

// 기본 아바타 이미지
export const DEFAULT_AVATAR_URL =
  'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish';
export const NAME_AVATAR_URL = (name: string = 'avatar') => {
  return DEFAULT_AVATAR_URL;
};

// 작은 아바타 이미지
export const DEFAULT_AVATAR_SMALL_URL =
  'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish';
// 'https://readdy.ai/api/search-image?query=professional%20portrait%20minimal%20avatar&width=32&height=32&seq=avatar1&orientation=squarish';

// 미니 아바타 이미지
export const DEFAULT_AVATAR_MINI_URL = 'https://i.pravatar.cc/24';

// 포스트 배경 이미지 예시
export const SAMPLE_POST_IMAGES = {
  MIDNIGHT_LOFI:
    'https://readdy.ai/api/search-image?query=cozy%20midnight%20bedroom%20with%20soft%20purple%20lighting%20and%20vinyl%20records%20scattered%20on%20wooden%20desk%2C%20aesthetic%20lo-fi%20music%20vibes%20with%20warm%20ambient%20glow&width=300&height=200&seq=post1&orientation=landscape',
  GYM_WORKOUT:
    'https://readdy.ai/api/search-image?query=modern%20gym%20interior%20with%20purple%20neon%20lighting%20and%20sleek%20equipment%2C%20energetic%20workout%20atmosphere%20with%20dynamic%20lighting%20effects&width=300&height=200&seq=post2&orientation=landscape',
  RAINY_JAZZ:
    'https://readdy.ai/api/search-image?query=rainy%20window%20view%20with%20jazz%20cafe%20interior%2C%20soft%20purple%20ambient%20lighting%20and%20vintage%20music%20equipment%20in%20cozy%20atmosphere&width=300&height=200&seq=post3&orientation=landscape',
  PEACEFUL_FOREST:
    'https://readdy.ai/api/search-image?query=peaceful%20forest%20scene%20with%20soft%20purple%20morning%20light%20filtering%20through%20trees%2C%20serene%20nature%20atmosphere%20with%20gentle%20ambient%20glow&width=300&height=200&seq=liked1&orientation=landscape',
  RETRO_STUDIO:
    'https://readdy.ai/api/search-image?query=retro%2090s%20music%20studio%20with%20vintage%20equipment%20and%20purple%20neon%20lights%2C%20nostalgic%20atmosphere%20with%20classic%20recording%20gear&width=300&height=200&seq=liked2&orientation=landscape',
};

// 썸네일 크기 버전
export const SAMPLE_POST_THUMBNAILS = {
  MIDNIGHT_LOFI:
    'https://readdy.ai/api/search-image?query=cozy%20midnight%20bedroom%20with%20soft%20purple%20lighting%20and%20vinyl%20records%20scattered%20on%20wooden%20desk%2C%20aesthetic%20lo-fi%20music%20vibes%20with%20warm%20ambient%20glow&width=80&height=80&seq=post1&orientation=landscape',
  GYM_WORKOUT:
    'https://readdy.ai/api/search-image?query=modern%20gym%20interior%20with%20purple%20neon%20lighting%20and%20sleek%20equipment%2C%20energetic%20workout%20atmosphere%20with%20dynamic%20lighting%20effects&width=80&height=80&seq=post2&orientation=landscape',
  RAINY_JAZZ:
    'https://readdy.ai/api/search-image?query=rainy%20window%20view%20with%20jazz%20cafe%20interior%2C%20soft%20purple%20ambient%20lighting%20and%20vintage%20music%20equipment%20in%20cozy%20atmosphere&width=80&height=80&seq=post3&orientation=landscape',
};
