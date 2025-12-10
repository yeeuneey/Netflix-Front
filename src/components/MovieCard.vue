<template>
  <article
    class="movie-card"
    @click="toggleWishlist"
    :class="{ wished: isWished }"
  >
    <div class="poster-wrapper">
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
        <button type="button" class="cta">
          {{ isWished ? 'Remove' : 'Add' }}
        </button>
      </div>
    </div>

    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>
      <p class="overview">
        {{ movie.overview || 'No description available.' }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '@/types/movie'
import { useWishlist } from '@/stores/wishlist'

const props = defineProps<{ movie: Movie }>()
const wishlist = useWishlist()

const posterUrl = computed(() => {
  if (!props.movie.poster_path) {
    return 'https://placehold.co/300x450/111827/EEE?text=No+Image'
  }
  return `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`
})

const isWished = computed(() =>
  wishlist.items.some((m) => m.id === props.movie.id),
)

const toggleWishlist = () => wishlist.toggle(props.movie)
</script>

<style scoped>
.movie-card {
  flex: 0 0 200px;
  min-width: 180px;
  cursor: pointer;
  background: #141414;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.08);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.55);
  z-index: 1;
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
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.65) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
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

.cta {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  border: 0;
  font-weight: 700;
  background: #e50914;
  color: #fff;
}

.info {
  padding: 10px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #f5f5f5;
}

.overview {
  margin: 0;
  font-size: 13px;
  color: #c9c9c9;
  line-height: 1.45;
  max-height: 52px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.wished {
  border: 2px solid #e50914;
}
</style>