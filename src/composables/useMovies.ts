import { ref } from 'vue';
import type { Movie } from '@/types/movie';
import { fetchMovies } from '@/api/tmdb';

export function useMovies(path: string, params: Record<string, any> = {}) {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    loading.value = true;
    error.value = null;
    try {
      movies.value = await fetchMovies(path, params);
    } catch (e) {
      error.value = '영화 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { movies, loading, error, load };
}
