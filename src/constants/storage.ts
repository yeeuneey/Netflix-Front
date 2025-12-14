// src/constants/storage.ts
// Centralized LocalStorage key names and default shapes used across the app.

export const STORAGE_KEYS = {
  users: 'nf_users',
  auth: 'nf_auth',
  tmdbKey: 'tmdb-key',
  wishlist: 'movieWishlist',
  recentSearches: 'recentSearches',
} as const;

export type StoredUser = {
  id: string; // email
  password: string; // TMDB API key
};

export type AuthPayload = {
  isLoggedIn: boolean;
  userId: string | null;
  keepLogin: boolean;
};

export const DEFAULT_AUTH: AuthPayload = {
  isLoggedIn: false,
  userId: null,
  keepLogin: false,
};

export const DEFAULT_USERS: StoredUser[] = [];
export const DEFAULT_RECENT_SEARCHES: string[] = [];
