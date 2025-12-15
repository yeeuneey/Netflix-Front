// Centralized TMDB URL and endpoint strings to avoid duplication or typos.

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_ENDPOINTS = {
  trendingWeek: '/trending/movie/week',
  popular: '/movie/popular',
  nowPlaying: '/movie/now_playing',
  topRated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  discover: '/discover/movie',
  search: '/search/movie',
} as const;