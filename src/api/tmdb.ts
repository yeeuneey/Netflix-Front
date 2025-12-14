import axios from 'axios';
import type { Movie } from '@/types/movie';
import { useAuthStore } from '@/stores/auth';
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from './tmdb/url';

const TMDB_FALLBACK_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

// Build a client that always injects the TMDB key from authStore (LocalStorage-backed),
// falling back to env for dev/demo. Language defaults to ko-KR.
const client = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    language: 'ko-KR',
  },
});

client.interceptors.request.use((config) => {
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
  const { data } = await client.get(path, {
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
  const { data } = await client.get(path, {
    params: {
      page: 1,
      ...extraParams,
    },
  });
  return data;
}

export { TMDB_ENDPOINTS };
