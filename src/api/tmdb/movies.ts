import { fetchFromTMDB } from './fetch';
import { TMDB_ENDPOINTS } from './url';

export const getPopularMovies = (page = 1) =>
  fetchFromTMDB(TMDB_ENDPOINTS.popular, { page });

export const getNowPlayingMovies = (page = 1) =>
  fetchFromTMDB(TMDB_ENDPOINTS.nowPlaying, { page });

export const getTopRatedMovies = (page = 1) =>
  fetchFromTMDB(TMDB_ENDPOINTS.topRated, { page });

export const getUpcomingMovies = (page = 1) =>
  fetchFromTMDB(TMDB_ENDPOINTS.upcoming, { page });
