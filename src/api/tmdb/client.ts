import axios from 'axios';
import { TMDB_BASE_URL } from './url';
import { loadTmdbKey } from '@/utils/storage';

const TMDB_FALLBACK_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_DEFAULT_LANGUAGE = 'ko-KR';

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
});

tmdbClient.interceptors.request.use((config) => {
  const apiKey = loadTmdbKey() || TMDB_FALLBACK_KEY;
  if (!apiKey) {
    throw new Error('TMDB API key not found');
  }

  config.params = {
    ...config.params,
    api_key: apiKey,
    language: config.params?.language ?? TMDB_DEFAULT_LANGUAGE,
  };

  return config;
});
