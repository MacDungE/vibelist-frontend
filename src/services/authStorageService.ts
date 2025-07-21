import type { User } from '@/types/user';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authStorageService = {
  getAccessToken: (): string | null => {
    try {
      const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      return accessToken ? JSON.parse(accessToken) : null;
    } catch (e) {
      console.error('Error getting access token from session storage', e);
      return null;
    }
  },

  setAccessToken: (token: string): void => {
    try {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(token));
    } catch (e) {
      console.error('Error setting access token in session storage', e);
    }
  },

  getUser: (): User | null => {
    try {
      const user = sessionStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error getting user from session storage', e);
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error setting user in session storage', e);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing session storage', e);
    }
  },
};
