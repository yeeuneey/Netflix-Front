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
  padding: 24px 20px;
}
.section h2 {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 800;
}
.movie-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 6px 4px 14px;
  scroll-snap-type: x mandatory;
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
</style>