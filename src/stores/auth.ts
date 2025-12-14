// src/stores/auth.ts
import { defineStore } from 'pinia';
import {
  DEFAULT_AUTH,
  DEFAULT_USERS,
  STORAGE_KEYS,
} from '@/constants/storage';
import type { AuthPayload, StoredUser } from '@/constants/storage';
import { readJSON, writeJSON } from '@/utils/storage';
import { readAuth } from '@/utils/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: readAuth(),
    users: readJSON<StoredUser[]>(STORAGE_KEYS.users, [...DEFAULT_USERS]),
    tmdbKey: localStorage.getItem(STORAGE_KEYS.tmdbKey) || '',
  }),

  getters: {
    isLoggedIn: (state) => state.auth.isLoggedIn,
    currentUser: (state) =>
      state.users.find((user) => user.id === state.auth.userId) || null,
  },

  actions: {
    setAuth(payload: Partial<AuthPayload>) {
      this.auth = { ...this.auth, ...payload };
      writeJSON(STORAGE_KEYS.auth, this.auth);
    },

    setUsers(users: StoredUser[]) {
      this.users = [...users];
      writeJSON(STORAGE_KEYS.users, this.users);
    },

    setTmdbKey(key: string) {
      this.tmdbKey = key;
      localStorage.setItem(STORAGE_KEYS.tmdbKey, key);
    },

    refreshFromStorage() {
      this.auth = readAuth();
      this.users = readJSON<StoredUser[]>(STORAGE_KEYS.users, [...DEFAULT_USERS]);
      this.tmdbKey = localStorage.getItem(STORAGE_KEYS.tmdbKey) || '';
    },

    logout() {
      if (this.auth.keepLogin) {
        this.setAuth({ ...this.auth, isLoggedIn: false });
      } else {
        localStorage.removeItem(STORAGE_KEYS.tmdbKey);
        this.setAuth({ ...DEFAULT_AUTH });
      }
    },
  },
});
