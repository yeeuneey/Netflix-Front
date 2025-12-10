import axios from 'axios';
import type { Movie } from '@/types/movie';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const client = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'ko-KR',
  },
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
