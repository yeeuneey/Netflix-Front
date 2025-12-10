<template>
  <article
    class="movie-card"
    @click="toggleWishlist"
    :class="{ wished: isWished }"
  >
    <div class="poster-wrapper">
      <div v-if="rank" class="rank-badge">
        <span class="rank-num">{{ rank }}</span>
        <span class="rank-label">TOP 10</span>
      </div>

      <button
        class="wishlist-indicator"
        type="button"
        :aria-pressed="isWished"
        @click.stop="toggleWishlist"
      >
        <i :class="['fa-solid', isWished ? 'fa-check' : 'fa-heart']"></i>
      </button>

      <img
        class="poster"
        :src="posterUrl"
        :alt="movie.title"
        loading="lazy"
      />

      <div class="overlay">
        <div class="badges">
          <span class="badge rating" v-if="movie.vote_average">
            ★ {{ movie.vote_average?.toFixed(1) }}
          </span>
          <span class="badge date" v-if="movie.release_date">
            {{ movie.release_date.slice(0, 4) }}
          </span>
        </div>

        <div class="overlay-bottom">
          <p class="overlay-title">{{ movie.title }}</p>
          <p class="overlay-overview">
            {{ movie.overview || 'No description available.' }}
          </p>
          <div class="overlay-actions">
            <button type="button" class="circle-btn" aria-label="재생">
              <i class="fa-solid fa-play"></i>
            </button>
            <button
              type="button"
              class="circle-btn"
              aria-label="위시 토글"
              @click.stop="toggleWishlist"
            >
              <i :class="['fa-solid', isWished ? 'fa-check' : 'fa-heart']"></i>
            </button>
            <button type="button" class="circle-btn" aria-label="상세 정보">
              <i class="fa-solid fa-circle-info"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>
      <p class="meta">
        <span v-if="movie.vote_average">★ {{ movie.vote_average?.toFixed(1) }}</span>
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

const toggleWishlist = () => wishlist.toggle(props.movie);
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.04);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  z-index: 1;
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

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 10%, rgba(0, 0, 0, 0.78) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.overlay-bottom {
  display: grid;
  gap: 8px;
}

.overlay-title {
  margin: 0;
  font-weight: 800;
  color: #fff;
  font-size: 15px;
  line-height: 1.3;
}

.overlay-overview {
  margin: 0;
  font-size: 12px;
  color: #e5e5e5;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overlay-actions {
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  align-items: center;
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

.badges {
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

.badge.rating {
  background: rgba(255, 255, 255, 0.14);
}

.badge.date {
  background: rgba(255, 255, 255, 0.08);
}

.wishlist-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.wishlist-indicator:hover {
  transform: scale(1.05);
  background: #e50914;
  border-color: #e50914;
}

.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.rank-num {
  font-size: 16px;
  font-weight: 800;
}

.rank-label {
  font-size: 11px;
  letter-spacing: 0.08em;
}

.info {
  padding: 8px 10px 12px;
  background: #0f0f0f;
}

.title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 4px;
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
</style>
