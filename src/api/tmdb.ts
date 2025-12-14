import type { Movie } from '@/types/movie';
import { useAuthStore } from '@/stores/auth';
import { TMDB_ENDPOINTS } from './tmdb/url';
import { tmdbClient } from './tmdb/client';

const TMDB_FALLBACK_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

// Inject TMDB key + language into every request via interceptor.
tmdbClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const apiKey = authStore.tmdbKey || TMDB_FALLBACK_KEY;

  config.params = {
    ...config.params,
    api_key: apiKey,
    language: config.params?.language ?? 'ko-KR',
  };

  return config;
});

export async function fetchMovies(
  path: string,
  extraParams: Record<string, string | number> = {}
): Promise<Movie[]> {
  const { data } = await tmdbClient.get(path, {
    params: extraParams,
  });
  return data.results ?? [];
}

export type MoviesPage = {
  page: number;
  total_pages: number;
  total_results: number;
  results: Movie[];
};

export async function fetchMoviesPage(
  path: string,
  extraParams: Record<string, string | number> = {}
): Promise<MoviesPage> {
  const { data } = await tmdbClient.get(path, {
    params: {
      page: 1,
      ...extraParams,
    },
  });
  return data;
}

export { TMDB_ENDPOINTS };
