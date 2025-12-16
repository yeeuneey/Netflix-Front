<template>
  <div class="search-page">
    <section class="search-hero">
      <div class="hero-text">
        <p class="eyebrow">SEARCH</p>
        <h1>보고 싶은 영화를 찾아보세요</h1>
      </div>

      <form class="search-bar" @submit.prevent="triggerSearch('manual')">
        <div class="input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="query"
            type="search"
            name="query"
            autocomplete="off"
            placeholder="제목, 배우 등 2글자 이상 입력해 주세요."
          />
          <button v-if="query" class="clear" type="button" aria-label="Clear" @click="clearQuery">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <button class="search-btn" type="submit" :disabled="!query.trim().length || loading">
          {{ loading ? '검색 중...' : '검색' }}
        </button>
      </form>

      <div class="filter-row">
        <div class="filter-group">
          <span class="label">정렬</span>
          <div class="pill-group sort-wide">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              type="button"
              class="pill ghost wide"
              :class="{ active: filters.sort === option.value }"
              @click="filters.sort = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="filter-selects">
        <div class="select-group">
          <label class="select-label" for="genre">장르</label>
          <select id="genre" v-model.number="filters.genre" class="select dark">
            <option :value="0">전체</option>
            <option v-for="g in genres" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </div>

        <div class="select-group">
          <label class="select-label" for="language">언어</label>
          <select id="language" v-model="filters.language" class="select dark">
            <option value="">전체</option>
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>

        <div class="select-group">
          <label class="select-label" for="year">개봉 연도</label>
          <select id="year" v-model="filters.yearRange" class="select dark">
            <option v-for="option in yearRanges" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button type="button" class="pill reset wide" @click="resetFilters" :disabled="!hasActiveFilters">
          필터 초기화
        </button>
      </div>

      <div v-if="recentSearches.length" class="recent-row">
        <span class="label">최근 검색</span>
        <div class="chip-group">
          <button
            v-for="term in recentSearches"
            :key="term"
            type="button"
            class="chip"
            @click="useRecent(term)"
          >
            {{ term }}
          </button>
          <button type="button" class="chip clear-chip" @click="clearRecent">전체 지우기</button>
        </div>
      </div>
    </section>

    <section class="results">
      <div class="results-head">
        <p v-if="lastQueried" class="stats">
          "{{ lastQueried }}" 에서 {{ filteredResults.length }}편을 찾았어요.
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <Loading v-if="loading" />

      <p v-else-if="!lastQueried" class="placeholder muted-center">
        검색어를 입력하면 TMDB에서 결과를 불러옵니다.
      </p>
      <p v-else-if="!filteredResults.length && !error" class="placeholder">
        조건에 맞는 결과가 없습니다.
      </p>

      <div v-if="filteredResults.length" class="grid">
        <MovieCard
          v-for="movie in filteredResults"
          :key="movie.id"
          :movie="movie"
          @detail="openDetail"
        />
      </div>

      <div v-if="loadingMore" class="infinite-loader">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>
          다음 페이지 로딩 중
          <span class="dots" aria-hidden="true">...</span>
        </span>
      </div>
    </section>

    <MovieDetailModal
      v-if="showDetail && selectedMovie"
      :movie="selectedMovie"
      :detail="detailData"
      :loading="detailLoading"
      :error="detailError"
      @close="closeDetail"
    />

    <button
      v-if="canScrollTop"
      type="button"
      class="top-button"
      aria-label="맨 위로 이동"
      @click="scrollToTop"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { Movie } from '@/types/movie';
import Loading from '@/components/Loading.vue';
import MovieCard from '@/components/common/MovieCard.vue';
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import { fetchMoviesPage, TMDB_ENDPOINTS } from '@/api/tmdb';
import { tmdbClient } from '@/api/tmdb/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { readJSON, writeJSON } from '@/utils/storage';

type SortOption = 'popularity' | 'recent' | 'rating' | 'title';
type SortValue = SortOption | '';
type YearRangeKey = 'all' | 'pre-1990' | '1990-1999' | '2000-2009' | '2010-2019' | '2020-plus';
type MovieDetail = {
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  cast?: { name: string; character?: string }[];
};

const query = ref('');
const lastQueried = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const rawResults = ref<Movie[]>([]);
const searchMode = ref<'discover' | 'query' | 'cast'>('discover');
const castPersonId = ref<number | null>(null);
const recentSearches = ref<string[]>([]);
const activeRequestId = ref(0);
const debounceId = ref<number | null>(null);
const page = ref(1);
const totalPages = ref(1);
const loadingMore = ref(false);
const canScrollTop = ref(false);
const AUTO_SEARCH_MIN = 2;
const AUTO_SEARCH_DELAY = 120;

const filters = reactive({
  sort: '' as SortValue,
  genre: 0 as number,
  language: '' as string,
  yearRange: 'all' as YearRangeKey,
});

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: '인기순' },
  { value: 'recent', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'title', label: '제목순' },
];

const sortToApiParam: Record<SortOption, string> = {
  popularity: 'popularity.desc',
  recent: 'primary_release_date.desc',
  rating: 'vote_average.desc',
  title: 'original_title.asc',
};

const yearRanges: { value: YearRangeKey; label: string; min?: number; max?: number }[] = [
  { value: 'all', label: '전체' },
  { value: '2020-plus', label: '2020년 이후', min: 2020 },
  { value: '2010-2019', label: '2010-2019', min: 2010, max: 2019 },
  { value: '2000-2009', label: '2000-2009', min: 2000, max: 2009 },
  { value: '1990-1999', label: '1990-1999', min: 1990, max: 1999 },
  { value: 'pre-1990', label: '1990년 이전', max: 1989 },
];

const genres = [
  { id: 28, name: '액션' },
  { id: 12, name: '어드벤처' },
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

const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: '영어' },
  { code: 'ja', label: '일본어' },
] as const;

const filteredResults = computed(() => {
  let list = [...rawResults.value];

  const yearRange = yearRanges.find((r) => r.value === filters.yearRange);
  if (yearRange && yearRange.value !== 'all') {
    list = list.filter((movie) => {
      const year = parseInt(movie.release_date?.split('-')[0] || '', 10);
      if (!Number.isFinite(year)) return false;
      if (typeof yearRange.min === 'number' && year < yearRange.min) return false;
      if (typeof yearRange.max === 'number' && year > yearRange.max) return false;
      return true;
    });
  }

  if (filters.genre) {
    list = list.filter((movie) => movie.genre_ids?.includes(filters.genre));
  }

  if (filters.language) {
    list = list.filter((movie) => movie.original_language === filters.language);
  }

  switch (filters.sort) {
    case 'rating':
      list = [...list].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
      break;
    case 'recent':
      list = [...list].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
      break;
    case 'title':
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'popularity':
      list = [...list].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      break;
    default:
      break;
  }

  return list;
});

const isDefaultFilters = computed(() => {
  return (
    filters.sort === '' &&
    filters.genre === 0 &&
    filters.language === '' &&
    filters.yearRange === 'all'
  );
});

const hasActiveFilters = computed(() => !isDefaultFilters.value);
const hasMore = computed(() => page.value < totalPages.value);

const scheduleSearch = () => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
  const term = query.value.trim();
  const hasEnoughTerm = term.length >= AUTO_SEARCH_MIN;
  const shouldRequest = hasEnoughTerm || (!term && !isDefaultFilters.value);
  if (!shouldRequest) {
    activeRequestId.value += 1;
    loading.value = false;
    return;
  }
  debounceId.value = window.setTimeout(() => triggerSearch('auto'), AUTO_SEARCH_DELAY);
};

watch(
  () => query.value,
  () => scheduleSearch()
);

watch(
  () => [filters.sort, filters.genre, filters.language, filters.yearRange],
  () => scheduleSearch()
);

onMounted(() => {
  recentSearches.value = readJSON<string[]>(STORAGE_KEYS.recentSearches, []);
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
  window.removeEventListener('scroll', handleScroll);
});

const triggerSearch = async (source: 'auto' | 'manual' = 'auto') => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
  const term = query.value.trim();
  const isDiscover = !term;
  const sortParam = filters.sort ? sortToApiParam[filters.sort] : sortToApiParam.popularity;
  const yearRange = yearRanges.find((y) => y.value === filters.yearRange);
  const requestId = ++activeRequestId.value;
  loading.value = true;
  error.value = null;
  page.value = 1;
  totalPages.value = 1;
  castPersonId.value = null;

  try {
    if (isDiscover) {
      searchMode.value = 'discover';
      const data = await fetchMoviesPage(TMDB_ENDPOINTS.discover, {
        include_adult: 'false',
        page: 1,
        sort_by: sortParam,
        ...(filters.genre ? { with_genres: filters.genre } : {}),
        ...(filters.language ? { with_original_language: filters.language } : {}),
        ...(yearRange && yearRange.value !== 'all'
          ? {
              ...(typeof yearRange.min === 'number'
                ? { 'primary_release_date.gte': `${yearRange.min}-01-01` }
                : {}),
              ...(typeof yearRange.max === 'number'
                ? { 'primary_release_date.lte': `${yearRange.max}-12-31` }
                : {}),
            }
          : {}),
      });
      if (requestId !== activeRequestId.value) return;
      rawResults.value = (data.results ?? []).filter((movie) => !!movie.poster_path);
      page.value = data.page ?? 1;
      totalPages.value = data.total_pages ?? 1;
      lastQueried.value = '추천 검색';
      return;
    }

    // 검색어가 있을 때
    // auto: 제목 검색만 빠르게 수행 (배우 검색은 manual일 때만 시도)
    if (source === 'auto') {
      searchMode.value = 'query';
      castPersonId.value = null;
      const movieData = await fetchMoviesPage(TMDB_ENDPOINTS.search, {
        query: term,
        include_adult: 'false',
        page: 1,
      });
      if (requestId !== activeRequestId.value) return;
      rawResults.value = (movieData.results ?? []).filter((m) => !!m.poster_path);
      page.value = movieData.page ?? 1;
      totalPages.value = movieData.total_pages ?? 1;
      lastQueried.value = term;
      return;
    }

    // manual: 제목 검색 + 배우 검색 보강
    const [movieData, personRes] = await Promise.all([
      fetchMoviesPage(TMDB_ENDPOINTS.search, {
        query: term,
        include_adult: 'false',
        page: 1,
      }),
      tmdbClient.get('/search/person', {
        params: {
          query: term,
          include_adult: 'false',
          page: 1,
        },
      }),
    ]);

    if (requestId !== activeRequestId.value) return;

    const moviesFromTitle = (movieData.results ?? []).filter((m) => !!m.poster_path);
    const topPersonId = personRes.data?.results?.[0]?.id as number | undefined;

    if (moviesFromTitle.length === 0 && topPersonId) {
      // 배우 이름으로 검색
      searchMode.value = 'cast';
      castPersonId.value = topPersonId;
      const castData = await fetchMoviesPage(TMDB_ENDPOINTS.discover, {
        include_adult: 'false',
        page: 1,
        sort_by: sortParam,
        with_cast: topPersonId,
        ...(filters.genre ? { with_genres: filters.genre } : {}),
        ...(filters.language ? { with_original_language: filters.language } : {}),
        ...(yearRange && yearRange.value !== 'all'
          ? {
              ...(typeof yearRange.min === 'number'
                ? { 'primary_release_date.gte': `${yearRange.min}-01-01` }
                : {}),
              ...(typeof yearRange.max === 'number'
                ? { 'primary_release_date.lte': `${yearRange.max}-12-31` }
                : {}),
            }
          : {}),
      });
      if (requestId !== activeRequestId.value) return;
      rawResults.value = (castData.results ?? []).filter((movie) => !!movie.poster_path);
      page.value = castData.page ?? 1;
      totalPages.value = castData.total_pages ?? 1;
    } else {
      searchMode.value = 'query';
      castPersonId.value = null;
      rawResults.value = moviesFromTitle;
      page.value = movieData.page ?? 1;
      totalPages.value = movieData.total_pages ?? 1;
    }

    lastQueried.value = term;
    if (!isDiscover && source === 'manual') {
      pushRecent(term);
    }
  } catch (e) {
    console.error(e);
    if (requestId !== activeRequestId.value) return;
    error.value = '검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    if (requestId === activeRequestId.value) {
      loading.value = false;
    }
  }
};

const pushRecent = (term: string) => {
  const next = [term, ...recentSearches.value.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
    0,
    6
  );
  recentSearches.value = next;
  writeJSON(STORAGE_KEYS.recentSearches, next);
};

const useRecent = (term: string) => {
  query.value = term;
  triggerSearch();
};

const clearRecent = () => {
  recentSearches.value = [];
  writeJSON(STORAGE_KEYS.recentSearches, []);
};

const clearQuery = () => {
  query.value = '';
  error.value = null;
  rawResults.value = [];
  lastQueried.value = '';
  searchMode.value = 'discover';
  castPersonId.value = null;
  page.value = 1;
  totalPages.value = 1;
  activeRequestId.value += 1;
  loading.value = false;
  scheduleSearch();
};

const resetFilters = () => {
  filters.sort = '';
  filters.genre = 0;
  filters.language = '';
  filters.yearRange = 'all';
  rawResults.value = [];
  lastQueried.value = '';
  searchMode.value = 'discover';
  castPersonId.value = null;
  page.value = 1;
  totalPages.value = 1;
  error.value = null;
  activeRequestId.value += 1;
  loading.value = false;
};

const showDetail = ref(false);
const detailLoading = ref(false);
const detailError = ref<string | null>(null);
const selectedMovie = ref<Movie | null>(null);
const detailData = ref<MovieDetail | null>(null);

const openDetail = async (movie: Movie) => {
  selectedMovie.value = movie;
  showDetail.value = true;
  detailLoading.value = true;
  detailError.value = null;
  detailData.value = null;
  try {
    const [detailRes, creditRes] = await Promise.all([
      tmdbClient.get(`/movie/${movie.id}`),
      tmdbClient.get(`/movie/${movie.id}/credits`),
    ]);
    detailData.value = {
      ...detailRes.data,
      cast: creditRes.data?.cast?.slice(0, 10) ?? [],
    };
  } catch (e) {
    console.error(e);
    detailError.value = '상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    detailLoading.value = false;
  }
};

const closeDetail = () => {
  showDetail.value = false;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadMore = async () => {
  if (!hasMore.value || loading.value || loadingMore.value) return;
  const currentTerm = query.value.trim();
  const isDiscover = !currentTerm && searchMode.value === 'discover';
  const nextPage = page.value + 1;
  const sortParam = filters.sort ? sortToApiParam[filters.sort] : sortToApiParam.popularity;
  const yearRange = yearRanges.find((y) => y.value === filters.yearRange);
  const requestId = activeRequestId.value;
  loadingMore.value = true;
  const startedAt = performance.now();
  try {
    const data = isDiscover
      ? await fetchMoviesPage(TMDB_ENDPOINTS.discover, {
          include_adult: 'false',
          page: nextPage,
          sort_by: sortParam,
          ...(filters.genre ? { with_genres: filters.genre } : {}),
          ...(filters.language ? { with_original_language: filters.language } : {}),
          ...(yearRange && yearRange.value !== 'all'
            ? {
                ...(typeof yearRange.min === 'number'
                  ? { 'primary_release_date.gte': `${yearRange.min}-01-01` }
                  : {}),
                ...(typeof yearRange.max === 'number'
                  ? { 'primary_release_date.lte': `${yearRange.max}-12-31` }
                  : {}),
              }
            : {}),
        })
      : searchMode.value === 'cast' && castPersonId.value
      ? await fetchMoviesPage(TMDB_ENDPOINTS.discover, {
          include_adult: 'false',
          page: nextPage,
          sort_by: sortParam,
          with_cast: castPersonId.value,
          ...(filters.genre ? { with_genres: filters.genre } : {}),
          ...(filters.language ? { with_original_language: filters.language } : {}),
          ...(yearRange && yearRange.value !== 'all'
            ? {
                ...(typeof yearRange.min === 'number'
                  ? { 'primary_release_date.gte': `${yearRange.min}-01-01` }
                  : {}),
                ...(typeof yearRange.max === 'number'
                  ? { 'primary_release_date.lte': `${yearRange.max}-12-31` }
                  : {}),
              }
            : {}),
        })
      : await fetchMoviesPage(TMDB_ENDPOINTS.search, {
          query: currentTerm,
          include_adult: 'false',
          page: nextPage,
        });
    if (requestId !== activeRequestId.value) return;
    page.value = data.page ?? nextPage;
    totalPages.value = data.total_pages ?? totalPages.value;
    rawResults.value = [...rawResults.value, ...data.results.filter((movie) => !!movie.poster_path)];
  } catch (e) {
    console.error(e);
  } finally {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, 2500 - elapsed);
    if (remaining) {
      await delay(remaining);
    }
    loadingMore.value = false;
  }
};

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const nearBottom = scrollTop + clientHeight >= scrollHeight - 200;
  if (nearBottom) {
    loadMore();
  }
  canScrollTop.value = scrollTop > 180;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped>
.search-page {
  display: grid;
  gap: 18px;
  margin-top: 4px;
  padding: 12px 12px 28px;
}

.search-hero {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: radial-gradient(circle at 10% 10%, rgba(229, 9, 20, 0.12), transparent 30%),
    radial-gradient(circle at 90% 10%, rgba(123, 109, 255, 0.14), transparent 24%),
    rgba(16, 18, 28, 0.9);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.eyebrow {
  margin: 0;
  color: #e50914;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.hero-text h1 {
  margin: 4px 0;
  font-size: clamp(24px, 4vw, 32px);
}

.hero-text .lede {
  margin: 0;
  color: #cbd3e8;
}

.search-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.input-wrap input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #f8f8f8;
  font-size: 1rem;
  padding-right: 32px;
}

.input-wrap input[type='search']::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.input-wrap i {
  color: #cbd3e8;
}

.input-wrap .clear {
  position: absolute;
  right: 8px;
  border: none;
  background: transparent;
  color: #f5f5f5;
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-btn {
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: #e50914;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  width: 100%;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(255, 61, 90, 0.3);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.filter-group {
  display: grid;
  gap: 6px;
  min-width: 0;
  width: 100%;
}

.filter-group.inline {
  grid-template-columns: auto auto;
  align-items: center;
  gap: 6px;
}

.filter-selects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: end;
  margin-top: 8px;
}

.select-group {
  display: grid;
  gap: 4px;
}

.select-label {
  font-weight: 800;
  color: #cbd3e8;
  font-size: 0.95rem;
}

.label {
  font-weight: 700;
  color: #cbd3e8;
  font-size: 0.9rem;
}

.pill-group {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
}

.pill-group.sort-wide {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  align-items: stretch;
}

.pill {
  padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 18px);
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border 0.2s ease;
  min-height: 42px;
  height: 100%;
  white-space: nowrap;
}

.pill.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f6f6f6;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.pill.active {
  background: #e50914;
  color: #ffffff;
  border-color: transparent;
}

.pill.wide {
  min-width: 0;
  justify-content: center;
  width: 100%;
}

.pill.reset {
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: #e50914;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  width: 100%;
}

.pill.reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pill.reset:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(255, 61, 90, 0.3);
}

.filter-selects .pill.reset {
  align-self: flex-end;
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .pill-group.sort-wide {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .filter-selects {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.checkbox input {
  width: 16px;
  height: 16px;
}

.filter-group input[type='text'] {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #f8f8f8;
}

.select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #f5f5f5;
  background: #0b0c14;
  color: #f5f5f5;
  font-weight: 800;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #f5f5f5 50%), linear-gradient(135deg, #f5f5f5 50%, transparent 50%);
  background-position: calc(100% - 18px) center, calc(100% - 12px) center;
  background-repeat: no-repeat;
  background-size: 6px 6px, 6px 6px;
  height: 46px;
}

.select option {
  background: #0b0c14;
  color: #f5f5f5;
}
.filter-group .value {
  font-weight: 800;
  color: #f8f8f8;
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chip-group {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: #f6f6f6;
  cursor: pointer;
  font-weight: 700;
}

.chip.clear-chip {
  background: rgba(255, 61, 90, 0.14);
  border-color: rgba(255, 61, 90, 0.4);
}

.results {
  display: grid;
  gap: 12px;
  padding: 0 8px 12px;
}

.results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stats {
  margin: 0;
  color: #e6e8f0;
  font-weight: 800;
}

.error {
  margin: 0;
  color: #e50914;
  font-weight: 700;
}

.placeholder {
  margin: 0;
  color: #e50914;
}

.placeholder.muted-center {
  display: grid;
  place-items: center;
  padding: 32px 0;
}

.grid {
  --grid-gap: 10px;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: var(--grid-gap);
  padding: 0 4px;
  width: 100%;
  justify-content: stretch;
}

:deep(.movie-card) {
  width: 100%;
  min-width: 0;
}

.infinite-loader {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #ff0019;
  font-weight: 700;
  margin: 10px 0 0;
}

.dots {
  display: inline-block;
  width: 22px;
  text-align: left;
}

.dots::after {
  content: '...';
}

.top-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: #E50914;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  z-index: 50;
}

.top-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(255, 61, 90, 0.4);
}

.top-button:active {
  transform: translateY(0);
}

.top-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-bar {
    grid-template-columns: 1fr;
  }

  .top-button {
    right: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
