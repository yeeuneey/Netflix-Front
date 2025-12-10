<!-- src/components/MovieCard.vue -->
<template>
  <div
    class="movie-card"
    :class="{ wished: isWished }"
    @click="toggleWishlist"
  >
    <div class="poster-wrapper">
      <img v-if="movie.poster_path" :src="imageUrl" :alt="movie.title" />
      <div v-else class="no-poster">
        <i class="fas fa-clapperboard"></i>
        <span>No Image</span>
      </div>
    </div>
    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>
      <slot name="extra" />
    </div>
    <button
      class="wishlist-badge"
      :class="{ active: isWished }"
      @click.stop="toggleWishlist"
    >
      <i class="fas fa-heart"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movie } from '@/types/movie';
import { useWishlist } from '@/stores/wishlist';

const props = defineProps<{ movie: Movie }>();

const wishlist = useWishlist();

const imageUrl = computed(
  () => `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`
);
const isWished = computed(() => wishlist.has(props.movie.id));

const toggleWishlist = () => {
  wishlist.toggle(props.movie);
};
</script>

<style scoped>
.movie-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(circle at top left, #39203b, #080808);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease;
}
.movie-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.85);
}

/* 추천 영화인 경우 다른 디자인 */
.movie-card.wished {
  border: 2px solid #ff3366;
  box-shadow: 0 0 18px rgba(255, 51, 102, 0.8);
}

.poster-wrapper {
  aspect-ratio: 2 / 3;
  overflow: hidden;
}
.poster-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}
.movie-card:hover .poster-wrapper img {
  transform: scale(1.08); /* hover 시 확대 */
}

.no-poster {
  width: 100%;
  height: 100%;
  background: #222;
  color: #aaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.info {
  padding: 0.6rem 0.7rem 0.8rem;
}
.title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

/* 우측 상단 하트 배지 */
.wishlist-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 999px;
  border: none;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5f5f5;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, color 0.2s;
}
.wishlist-badge.active {
  background: #ff3366;
  color: #fff;
}
.wishlist-badge:hover {
  transform: scale(1.08);
}
</style>
