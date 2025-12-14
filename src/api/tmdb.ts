import type { Movie } from '@/types/movie';
import { TMDB_ENDPOINTS } from './tmdb/url';
import { tmdbClient } from './tmdb/client';

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
