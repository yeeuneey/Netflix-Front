// src/stores/wishlist.ts
import { defineStore } from 'pinia';
import type { Movie } from '@/types/movie';
import { STORAGE_KEYS } from '@/constants/storage';

export const useWishlist = defineStore('wishlist', {
  state: () => ({
    items: JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist) || '[]') as Movie[],
  }),

  getters: {
    has: (state) => (id: number) => state.items.some((m) => m.id === id),
  },

  actions: {
    toggle(movie: Movie) {
      const exists = this.items.some((m) => m.id === movie.id);

      if (exists) {
        this.items = this.items.filter((m) => m.id !== movie.id);
      } else {
        this.items.push(movie);
      }

      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(this.items));
    },
  },
});
