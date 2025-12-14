// src/utils/bootstrapStorage.ts
// Initialize required LocalStorage keys and migrate legacy keys when needed.

import {
  DEFAULT_AUTH,
  DEFAULT_RECENT_SEARCHES,
  DEFAULT_USERS,
  STORAGE_KEYS,
} from '@/constants/storage';
import { bootstrapKey, readJSON, writeJSON } from './storage';

export const bootstrapStorage = () => {
  bootstrapKey(STORAGE_KEYS.auth, DEFAULT_AUTH);
  bootstrapKey(STORAGE_KEYS.users, DEFAULT_USERS);
  bootstrapKey(STORAGE_KEYS.recentSearches, DEFAULT_RECENT_SEARCHES);

  if (!localStorage.getItem(STORAGE_KEYS.tmdbKey)) {
    localStorage.setItem(STORAGE_KEYS.tmdbKey, '');
  }

  if (!localStorage.getItem(STORAGE_KEYS.wishlist)) {
    const legacyWishlist = localStorage.getItem('wishlist');
    if (legacyWishlist) {
      localStorage.setItem(STORAGE_KEYS.wishlist, legacyWishlist);
    } else {
      writeJSON(STORAGE_KEYS.wishlist, []);
    }
  } else {
    // Normalize malformed JSON just in case.
    const normalized = readJSON(STORAGE_KEYS.wishlist, []);
    writeJSON(STORAGE_KEYS.wishlist, normalized);
  }
};
