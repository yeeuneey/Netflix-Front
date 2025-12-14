import {
  DEFAULT_AUTH,
  DEFAULT_USERS,
  STORAGE_KEYS,
  type AuthPayload,
  type StoredUser,
} from '@/constants/storage';
import { readJSON, writeJSON } from '@/utils/storage';

type AuthResult<T = void> = { ok: true; message: string; data?: T } | { ok: false; message: string };

const setAuth = (payload: AuthPayload) => {
  writeJSON<AuthPayload>(STORAGE_KEYS.auth, payload);
};

const setTmdbKey = (key: string) => {
  localStorage.setItem(STORAGE_KEYS.tmdbKey, key);
};

export const loadUsers = (): StoredUser[] => readJSON<StoredUser[]>(STORAGE_KEYS.users, [...DEFAULT_USERS]);

export const saveUsers = (users: StoredUser[]) => writeJSON<StoredUser[]>(STORAGE_KEYS.users, users);

export const register = (email: string, password: string): AuthResult => {
  const users = loadUsers();
  const exists = users.some((user) => user.id === email);
  if (exists) {
    return { ok: false, message: '이미 가입된 이메일입니다.' };
  }

  const nextUsers = [...users, { id: email, password }];
  saveUsers(nextUsers);

  setTmdbKey(password);
  setAuth({ isLoggedIn: true, userId: email, keepLogin: false });

  return { ok: true, message: '회원가입이 완료되었습니다.' };
};

export const login = (email: string, password: string, keepLogin = true): AuthResult => {
  const users = loadUsers();
  const user = users.find((item) => item.id === email && item.password === password);

  if (!user) {
    return { ok: false, message: '이메일 또는 키가 올바르지 않습니다.' };
  }

  setTmdbKey(password);
  setAuth({ isLoggedIn: true, userId: email, keepLogin });

  return { ok: true, message: '로그인되었습니다.' };
};

export const logout = (): AuthResult => {
  const auth = readJSON<AuthPayload>(STORAGE_KEYS.auth, { ...DEFAULT_AUTH });
  if (auth.keepLogin) {
    // 유지 로그인이면 세션만 끄고 id는 유지
    setAuth({ ...auth, isLoggedIn: false });
  } else {
    // 아니면 전체 초기화
    localStorage.removeItem(STORAGE_KEYS.tmdbKey);
    setAuth({ ...DEFAULT_AUTH });
  }
  return { ok: true, message: '로그아웃되었습니다.' };
};

export const getAuth = (): AuthResult<AuthPayload> => {
  const auth = readJSON<AuthPayload>(STORAGE_KEYS.auth, { ...DEFAULT_AUTH });
  return { ok: true, message: '현재 인증 상태를 반환합니다.', data: auth };
};
