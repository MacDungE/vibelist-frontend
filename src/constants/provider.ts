export const PROVIDER_DETAILS = {
  google: {
    displayName: 'Google',
    icon: 'fab fa-google',
    color: 'bg-blue-50 text-blue-700',
  },
  kakao: {
    displayName: '카카오',
    icon: 'fas fa-comment',
    color: 'bg-yellow-50 text-yellow-700',
  },
  spotify: {
    displayName: 'Spotify',
    icon: 'fab fa-spotify',
    color: 'bg-green-50 text-green-700',
  },
  default: {
    displayName: '알 수 없음',
    icon: 'fas fa-user',
    color: 'bg-gray-50 text-gray-700',
  },
} as const;

type ProviderKey = keyof typeof PROVIDER_DETAILS;

export const getProviderDetails = (providerKey?: string) => {
  const key = providerKey as ProviderKey;
  return PROVIDER_DETAILS[key] || PROVIDER_DETAILS.default;
};
