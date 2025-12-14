// src/stores/auth.ts
import { defineStore } from 'pinia';
import {
  AuthPayload,
  DEFAULT_AUTH,
  DEFAULT_USERS,
  STORAGE_KEYS,
  StoredUser,
} from '@/constants/storage';
import { readJSON, writeJSON } from '@/utils/storage';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: readJSON<AuthPayload>(STORAGE_KEYS.auth, { ...DEFAULT_AUTH }),
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

    logout() {
      this.setAuth({ ...DEFAULT_AUTH });
    },
  },
});
