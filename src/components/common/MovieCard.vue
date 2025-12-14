<template>
  <article
    class="movie-card"
    :class="{ wished: isWished, recommended: isWished }"
    @click="toggleWishlist"
  >
    <div class="poster-wrapper">
      <div class="poster-chrome">
        <div v-if="rank" :class="['rank-badge', rankTierClass]">
          <span class="rank-label">TOP</span>
          <span class="rank-num">{{ rank }}</span>
          <span class="rank-glow" aria-hidden="true"></span>
        </div>
        <button
          class="wishlist-indicator"
          type="button"
          :aria-pressed="isWished"
          @click.stop="toggleWishlist"
        >
          <i :class="['fa-solid', isWished ? 'fa-heart' : 'fa-heart']"></i>
        </button>
      </div>

      <img
        class="poster"
        :src="posterUrl"
        :alt="`${movie.title} 포스터`"
        loading="lazy"
      />

      <div class="overlay">
        <div class="overlay-content">
          <p class="overlay-overview">
            {{ movie.overview || '줄거리가 준비되지 않았어요.' }}
          </p>
        </div>
        <button
          type="button"
          class="detail-btn"
          aria-label="상세 보기"
          @click.stop="emitDetail"
        >
          <i class="fa-solid fa-circle-info"></i>
        </button>
      </div>
    </div>

    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>
      <p class="meta">
        <span v-if="movie.vote_average">평점 {{ movie.vote_average?.toFixed(1) }}</span>
        <span v-if="movie.release_date">· {{ movie.release_date.slice(0, 4) }}</span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movie } from '@/types/movie';
import { useWishlist } from '@/stores/wishlist';

const props = defineProps<{ movie: Movie; rank?: number | null }>();
const emit = defineEmits<{ (e: 'detail', movie: Movie): void }>();
const wishlist = useWishlist();

const posterUrl = computed(() => {
  if (!props.movie.poster_path) {
    return 'https://placehold.co/300x450/111827/EEE?text=No+Image';
  }
  return `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`;
});

const isWished = computed(() =>
  wishlist.items.some((m) => m.id === props.movie.id),
);

const rankTierClass = computed(() => {
  if (!props.rank) return 'rank-default';
  if (props.rank === 1) return 'rank-gold';
  if (props.rank === 2) return 'rank-silver';
  if (props.rank === 3) return 'rank-bronze';
  return 'rank-default';
});

const toggleWishlist = () => wishlist.toggle(props.movie);
const emitDetail = () => emit('detail', props.movie);
</script>

<style scoped>
.movie-card {
  flex: 0 0 clamp(200px, 18vw, 220px);
  min-width: clamp(200px, 18vw, 220px);
  cursor: pointer;
  background: #141414;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.movie-card:hover {
  transform: scale(1.06);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
  z-index: 2;
}

@media (max-width: 640px) {
  .movie-card {
    flex-basis: clamp(170px, 58vw, 200px);
    min-width: clamp(170px, 58vw, 200px);
  }
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: #0f0f0f;
}

.poster-chrome {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px;
  pointer-events: none;
  z-index: 2;
}

.poster-chrome::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 35%);
  z-index: -1;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster {
  transform: scale(1.04);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 5%, rgba(0, 0, 0, 0.9) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.overlay-content {
  width: 100%;
  max-width: 100%;
  display: grid;
  place-items: center;
  text-align: center;
}

.overlay-overview {
  margin: 0;
  font-size: 14px;
  color: #f5f5f5;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  border-radius: 12px;
  font-size: 20px;
}
.detail-btn:hover {
  transform: translateY(-1px);
  background: #e50914;
}

.circle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.circle-btn:hover {
  transform: translateY(-1px);
  background: #e50914;
  border-color: #e50914;
}

.wishlist-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  pointer-events: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.wishlist-indicator:hover {
  transform: scale(1.05);
  background: rgba(229, 9, 20, 0.8);
}

.wishlist-indicator i {
  font-size: 16px;
  transition: color 0.2s ease, transform 0.2s ease;
}
.wishlist-indicator[aria-pressed='true'] {
  background: rgba(229, 9, 20, 0.9);
}
.wishlist-indicator[aria-pressed='true'] i {
  color: #fff;
  transform: scale(1.1);
}

.rank-badge {
  pointer-events: auto;
  position: relative;
  min-width: 64px;
  padding: 8px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff4b4b, #e50914 65%, #ff7f7f);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45), 0 12px 28px rgba(229, 9, 20, 0.32);
  overflow: hidden;
  isolation: isolate;
}
.rank-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 55%);
  opacity: 0.9;
}
.rank-badge .rank-glow {
  position: absolute;
  inset: -22px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 60%);
  filter: blur(12px);
  opacity: 0.7;
  z-index: 0;
}
.rank-label {
  position: relative;
  z-index: 1;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.rank-num {
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
.rank-gold {
  background: linear-gradient(135deg, #ffdd55, #f6b100 65%, #ffd877);
  color: #3a2500;
}
.rank-gold .rank-label,
.rank-gold .rank-num {
  text-shadow: none;
}
.rank-silver {
  background: linear-gradient(135deg, #dfe7f3, #a4b3d1 65%, #d2dbe9);
  color: #0f182b;
}
.rank-bronze {
  background: linear-gradient(135deg, #ffb480, #d77a37 65%, #ffd2b0);
  color: #2c1300;
}

.info {
  padding: 8px 10px 12px;
  background: #0f0f0f;
  display: grid;
  gap: 4px;
}

.title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  margin: 0;
  font-size: 12px;
  color: #c9c9c9;
  display: flex;
  gap: 6px;
}

.wished {
  border: 2px solid #e50914;
}
.recommended {
  outline: 2px solid #e50914;
  box-shadow: 0 0 4px rgba(229, 9, 20, 0.25);
}
</style>
