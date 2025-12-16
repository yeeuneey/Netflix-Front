// src/utils/storage.ts
// Safe LocalStorage helpers to keep parsing/writing consistent.
import { STORAGE_KEYS } from '@/constants/storage';

export const readJSON = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to parse "${key}", falling back.`, error);
    return fallback;
  }
};

export const writeJSON = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const bootstrapKey = <T>(key: string, value: T) => {
  if (!localStorage.getItem(key)) {
    writeJSON(key, value);
  }
};

export const loadTmdbKey = () => localStorage.getItem(STORAGE_KEYS.tmdbKey) || '';
