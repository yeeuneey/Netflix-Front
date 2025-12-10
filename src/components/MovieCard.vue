<template>
  <div 
    class="movie-card" 
    @click="toggleWishlist"
    :class="{ wished: isWished }"
  >
    <div class="poster-wrapper">
      <img 
        class="poster" 
        :src="posterUrl" 
        :alt="movie.title" 
      />
    </div>

    <div class="info">
      <h3 class="title">{{ movie.title }}</h3>

      <!-- 영화 설명(반드시 1개 이상 포함) -->
      <p class="overview">
        {{ movie.overview || 'No description available.' }}
      </p>

      <!-- Optional 정보들 -->
      <p class="meta">
        ⭐ {{ movie.vote_average }}  
        · 📅 {{ movie.release_date || 'N/A' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movie } from '@/types/movie';
import { useWishlist } from '@/stores/wishlist';

const props = defineProps<{ movie: Movie }>();
const wishlist = useWishlist();

const posterUrl = computed(() =>
  `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`
);

const isWished = computed(() =>
  wishlist.items.some(m => m.id === props.movie.id)
);

const toggleWishlist = () => wishlist.toggle(props.movie);
</script>

<style scoped>
.movie-card {
  width: 200px;
  cursor: pointer;
  background: #1c1c1c;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.movie-card:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}

.poster-wrapper {
  width: 100%;
  height: 280px;
  overflow: hidden;
}
.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  padding: 10px;
}
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.overview {
  font-size: 12px;
  opacity: 0.85;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
}

.wished {
  border: 2px solid #ff0044;
}
</style>
