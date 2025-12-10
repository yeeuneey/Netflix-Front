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
  padding: 30px 20px;
}
.section h2 {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
}
.movie-list {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
}
.error {
  color: #ff4444;
}
</style>
