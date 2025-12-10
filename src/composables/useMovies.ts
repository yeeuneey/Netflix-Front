import { ref } from 'vue'
import type { Movie } from '@/types/movie'
import { fetchMovies } from '@/api/tmdb'

export function useMovies(path: string, params: Record<string, any> = {}) {
  const movies = ref<Movie[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      movies.value = await fetchMovies(path, params)
    } catch (e) {
      error.value = '영화 데이터를 불러오는 중 문제가 발생했습니다.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return { movies, loading, error, load }
}
