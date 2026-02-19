import { TOKEN_KEY } from './constants';

/**
 * Get auth token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set auth token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove auth token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get user from localStorage
 */
export const getStoredUser = <T>(): T | null => {
  const user = localStorage.getItem('hkids_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set user in localStorage
 */
export const setStoredUser = <T>(user: T): void => {
  localStorage.setItem('hkids_user', JSON.stringify(user));
};

/**
 * Remove user from localStorage
 */
export const removeStoredUser = (): void => {
  localStorage.removeItem('hkids_user');
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  removeToken();
  removeStoredUser();
};

/**
 * Store data with expiry
 */
export const setWithExpiry = (key: string, value: unknown, ttl: number): void => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get data with expiry check
 */
export const getWithExpiry = <T>(key: string): T | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};
