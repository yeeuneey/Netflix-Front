import axios, { type AxiosError } from 'axios';
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

tmdbClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // Map common TMDB error cases to readable messages.
    if (status === 401) {
      return Promise.reject(new Error('TMDB API key가 유효하지 않습니다.'));
    }
    if (status === 429) {
      return Promise.reject(new Error('TMDB API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.'));
    }

    const isNetworkError = !error.response && !!error.message;
    if (isNetworkError) {
      return Promise.reject(new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.'));
    }

    return Promise.reject(error);
  }
);
