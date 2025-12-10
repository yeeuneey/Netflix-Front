<template>
  <section class="section">
    <h2>{{ title }}</h2>

    <Loading v-if="loading" />

    <div v-else class="movie-list">
      <MovieCard
        v-for="m in movies"
        :key="m.id"
        :movie="m"
      />
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMovies } from '@/composables/useMovies';
import MovieCard from './MovieCard.vue';
import Loading from './Loading.vue';

const props = defineProps<{
  title: string;
  path: string;
}>();

const { movies, error, loading, load } = useMovies(props.path);

onMounted(() => load());
</script>

<style scoped>
.section {
  padding: 20px 0;
}
.section h2 {
  margin: 0 0 15px;
  font-size: 20px;
  font-weight: 800;
}
.movie-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 18vw);
  gap: 12px;
  overflow-x: auto;
  padding: 6px 4px 14px;
  scroll-snap-type: x mandatory;
  scroll-padding: 4px;
}
.movie-list::-webkit-scrollbar {
  height: 6px;
}
.movie-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}
.movie-list > * {
  scroll-snap-align: start;
}
.error {
  color: #ff4444;
}

@media (min-width: 1100px) {
  .movie-list {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    overflow: visible;
    scroll-snap-type: none;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 16px 0;
  }
  .movie-list {
    grid-auto-columns: minmax(130px, 54vw);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .movie-list {
    grid-auto-columns: minmax(120px, 70vw);
    gap: 8px;
  }
}
</style>
