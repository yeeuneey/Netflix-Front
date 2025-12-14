import axios from 'axios';
import { TMDB_BASE_URL } from './url';

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
});
