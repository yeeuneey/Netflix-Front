<template>
  <div class="wishlist-page">
    <header class="wishlist-hero">
      <div class="hero-copy">
        <p class="eyebrow">위시리스트</p>
        <h1>내가 찜한 리스트</h1>
        <p class="lede">찜한 영화들을 검색·정렬·필터로 바로 찾아보세요!</p>
        <div class="hero-meta">
          <span class="chip primary">{{ wishlistCount }}편 저장</span>
          <span v-if="filtersActive" class="chip ghost">필터 적용됨</span>
        </div>
      </div>
      <div class="hero-actions">
        <button type="button" class="pill primary" @click="goTo('/search')">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>작품 찾기</span>
        </button>
        <button type="button" class="pill ghost" @click="goTo('/popular')">
          <i class="fa-solid fa-fire"></i>
          <span>인기작 보기</span>
        </button>
      </div>
    </header>

    <section v-if="wishlistCount" class="controls">
      <div class="search-control">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          v-model="searchTerm"
          type="text"
          name="search"
          autocomplete="off"
          placeholder="내 위시리스트에서 검색"
        />
        <button v-if="searchTerm" type="button" class="clear" aria-label="Clear" @click="searchTerm = ''">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="filter-row">
        <div class="pill-group" role="group" aria-label="Sort wishlist">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            class="pill ghost"
            :class="{ active: filters.sort === option.value }"
            @click="filters.sort = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="select-row">
          <label class="select-group">
            <span class="select-label">장르</span>
            <select v-model.number="filters.genre" class="select">
              <option :value="0">전체</option>
              <option v-for="g in genreOptions" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>
          </label>

          <label class="select-group">
            <span class="select-label">개봉 연도</span>
            <select v-model="filters.year" class="select">
              <option value="all">전체</option>
              <option value="2020-plus">2020년 이후</option>
              <option value="2010-2019">2010~2019</option>
              <option value="2000-2009">2000~2009</option>
              <option value="1990-1999">1990~1999</option>
              <option value="pre-1990">1990년 이전</option>
            </select>
          </label>

          <label class="select-group">
            <span class="select-label">언어</span>
            <select v-model="filters.language" class="select">
              <option value="">전체</option>
              <option v-for="lang in languageOptions" :key="lang.code" :value="lang.code">
                {{ lang.label }}
              </option>
            </select>
          </label>
        </div>

        <button
          type="button"
          class="pill reset"
          :disabled="!filtersActive"
          @click="resetFilters"
        >
          필터 초기화
        </button>
      </div>
    </section>

    <Loading v-if="loading" />

    <section v-else class="wishlist-content">
      <div v-if="!wishlistCount" class="empty">
        <div class="empty-icon">
          <i class="fa-regular fa-heart"></i>
        </div>
        <h2>찜한 영화가 없어요</h2>
        <p class="muted">영화 카드의 하트를 눌러 리스트를 채워보세요.</p>
      </div>

      <div v-else-if="!filteredWishlist.length" class="empty">
        <div class="empty-icon">
          <i class="fa-solid fa-filter"></i>
        </div>
        <h2>필터에 맞는 결과가 없어요</h2>
        <p class="muted">필터를 재설정하고 찜한 영화들을 다시 확인하세요.</p>
      </div>

      <div v-else class="grid">
        <MovieCard
          v-for="movie in filteredWishlist"
          :key="movie.id"
          :movie="movie"
          @detail="openDetail"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import MovieCard from '@/components/common/MovieCard.vue';
import Loading from '@/components/Loading.vue';
import type { Movie } from '@/types/movie';
import { useWishlist } from '@/stores/wishlist';
import { STORAGE_KEYS } from '@/constants/storage';
import { readJSON } from '@/utils/storage';

type SortKey = 'saved' | 'release' | 'rating' | 'title';
type YearFilter = 'all' | '2020-plus' | '2010-2019' | '2000-2009' | '1990-1999' | 'pre-1990';

const wishlistStore = useWishlist();
const { items } = storeToRefs(wishlistStore);

const loading = ref(true);
const searchTerm = ref('');
const filters = reactive({
  sort: 'saved' as SortKey,
  genre: 0 as number,
  year: 'all' as YearFilter,
  language: '' as string,
});

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'saved', label: '추가순' },
  { value: 'release', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'title', label: '제목순' },
];

const wishlistCount = computed(() => items.value.length);

const genreOptions = [
  { id: 28, name: '액션' },
  { id: 12, name: '모험' },
  { id: 16, name: '애니메이션' },
  { id: 35, name: '코미디' },
  { id: 80, name: '범죄' },
  { id: 18, name: '드라마' },
  { id: 14, name: '판타지' },
  { id: 27, name: '공포' },
  { id: 10749, name: '로맨스' },
  { id: 878, name: 'SF' },
  { id: 53, name: '스릴러' },
] as const;

const languageOptions = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: '영어' },
  { code: 'ja', label: '일본어' },
] as const;

const filtersActive = computed(
  () =>
    Boolean(searchTerm.value.trim()) ||
    filters.sort !== 'saved' ||
    filters.genre !== 0 ||
    filters.year !== 'all' ||
    Boolean(filters.language),
);

const filteredWishlist = computed(() => {
  let list = [...items.value];
  const term = searchTerm.value.trim().toLowerCase();

  if (term) {
    list = list.filter((movie) => movie.title.toLowerCase().includes(term));
  }

  if (filters.genre) {
    list = list.filter((movie) => movie.genre_ids?.includes(filters.genre));
  }

  if (filters.year !== 'all') {
    list = list.filter((movie) => {
      const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
      if (!year) return false;
      if (filters.year === '2020-plus') return year >= 2020;
      if (filters.year === '2010-2019') return year >= 2010 && year <= 2019;
      if (filters.year === '2000-2009') return year >= 2000 && year <= 2009;
      if (filters.year === '1990-1999') return year >= 1990 && year <= 1999;
      return year < 1990;
    });
  }

  if (filters.language) {
    list = list.filter(
      (movie) =>
        (movie.original_language || '').toLowerCase() === filters.language.toLowerCase(),
    );
  }

  switch (filters.sort) {
    case 'release':
      list.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
      break;
    case 'rating':
      list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      break;
    case 'title':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return list;
});

const goTo = (path: string) => window.location.assign(path);

const resetFilters = () => {
  searchTerm.value = '';
  filters.sort = 'saved';
  filters.genre = 0;
  filters.year = 'all';
  filters.language = '';
};

const openDetail = (movie: Movie) => {
  // 위시리스트에서는 클릭 시 찜 해제 동작을 우선한다.
  wishlistStore.toggle(movie);
};

const loadWishlist = () => {
  const stored = readJSON<Movie[]>(STORAGE_KEYS.wishlist, []);
  wishlistStore.set(stored);
  loading.value = false;
};

onMounted(loadWishlist);
</script>

<style scoped>
.wishlist-page {
  display: grid;
  gap: 20px;
  padding: 80px 18px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.wishlist-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  padding: 24px 20px;
  border-radius: 14px;
  background: radial-gradient(circle at 10% 10%, rgba(229, 9, 20, 0.12), transparent 30%),
    radial-gradient(circle at 90% 10%, rgba(123, 109, 255, 0.14), transparent 24%),
    rgba(16, 18, 28, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.hero-copy h1 {
  margin: 0 0 6px;
  font-size: 1.9rem;
  letter-spacing: 0.01em;
}

.hero-copy .lede {
  margin: 0 0 12px;
  color: #cdd3e4;
  max-width: 640px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
}

.chip.primary {
  background: rgba(229, 9, 20, 0.14);
  color: #ffdce0;
  border: 1px solid rgba(229, 9, 20, 0.4);
}

.chip.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: #d8deee;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.controls {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(18, 20, 28, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.search-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 12px;
}

.search-control input {
  flex: 1;
  background: transparent;
  border: none;
  color: #f5f5f5;
  font-size: 1rem;
}

.search-control input:focus {
  outline: none;
}

/* 브라우저 기본 검색 클리어 버튼 숨김 */
.search-control input::-webkit-search-cancel-button,
.search-control input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.search-control .clear {
  border: none;
  background: transparent;
  color: #9aa6c8;
  cursor: pointer;
}

.filter-row {
  display: grid;
  gap: 12px;
  align-items: center;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.pill.primary {
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  border-color: rgba(255, 255, 255, 0.12);
}

.pill.ghost {
  border-color: rgba(255, 255, 255, 0.12);
}

.pill.ghost.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.24);
}

.pill.reset {
  justify-self: flex-start;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.12);
  color: #d3daea;
}

.pill:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.select-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.select-group {
  display: grid;
  gap: 6px;
  font-size: 0.95rem;
  color: #d8deee;
}

.select-label {
  font-weight: 800;
  color: #f6f6f6;
  font-size: 0.95rem;
}

.select {
  width: 100%;
  min-width: 140px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #f5f5f5;
  background: #0b0c14;
  color: #f5f5f5;
  font-weight: 800;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #f5f5f5 50%),
    linear-gradient(135deg, #f5f5f5 50%, transparent 50%);
  background-position: calc(100% - 18px) center, calc(100% - 12px) center;
  background-repeat: no-repeat;
  background-size: 6px 6px, 6px 6px;
  height: 46px;
}

.select option {
  background: #0b0c14;
  color: #f5f5f5;
}

.wishlist-content {
  min-height: 240px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
  justify-items: center;
}

.empty {
  padding: 32px 20px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
  display: grid;
  gap: 10px;
  justify-items: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(229, 9, 20, 0.18);
  color: #ffd4db;
  font-size: 1.4rem;
}

.empty h2 {
  margin: 8px 0 2px;
}

.muted {
  color: #9aa6c8;
  margin: 0;
}

.empty-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .wishlist-page {
    padding: 70px 12px 24px;
  }

  .wishlist-hero {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .pill-group {
    justify-content: flex-start;
  }
}
</style>
