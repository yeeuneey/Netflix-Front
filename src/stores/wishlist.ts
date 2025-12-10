// src/stores/wishlist.ts
import { defineStore } from 'pinia';
import type { Movie } from '@/types/movie';

const STORAGE_KEY = 'wishlist';

export const useWishlist = defineStore('wishlist', {
  state: () => ({
    items: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Movie[],
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
  },
});
