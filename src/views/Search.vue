<template>
  <div class="search-page">
    <section class="search-hero">
      <div class="hero-text">
        <p class="eyebrow">SEARCH</p>
        <h1>찾아보기</h1>
      </div>

      <form class="search-bar" @submit.prevent="triggerSearch">
        <div class="input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="query"
            type="search"
            name="query"
            autocomplete="off"
          placeholder="제목이나 키워드를 입력하세요"
        />
        <button v-if="query" class="clear" type="button" aria-label="Clear" @click="clearQuery">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <button class="search-btn" type="submit" :disabled="!query.trim().length || loading">
        {{ loading ? '검색 중...' : '검색하기' }}
      </button>
    </form>

      <div class="filter-row">
        <div class="filter-group">
          <span class="label">정렬</span>
          <div class="pill-group">
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
        </div>

        <div class="filter-group inline">
          <label class="label" for="minScore">최소 평점</label>
          <input
            id="minScore"
            v-model.number="filters.minScore"
            type="range"
            min="0"
            max="10"
            step="0.5"
          />
          <span class="value">{{ filters.minScore.toFixed(1) }}</span>
        </div>

        <div class="filter-group inline">
          <label class="label" for="year">연도</label>
          <input
            id="year"
            v-model="filters.year"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="예: 2024"
          />
        </div>

        <label class="checkbox">
          <input v-model="filters.onlyPoster" type="checkbox" />
          <span>포스터 있는 영화만</span>
        </label>
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
          <button type="button" class="chip clear-chip" @click="clearRecent">지우기</button>
        </div>
      </div>
    </section>

    <section class="results">
      <div class="results-head">
        <p v-if="lastQueried" class="stats">
          "{{ lastQueried }}" · {{ filteredResults.length }}개 결과
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <Loading v-if="loading" />

      <p v-else-if="!lastQueried" class="placeholder">검색어를 입력하면 YENFLIX가 찾아볼게요.</p>
      <p v-else-if="!filteredResults.length && !error" class="placeholder">
        현재 필터에 맞는 영화가 없어요.
      </p>

      <div v-if="filteredResults.length" class="grid">
        <MovieCard
          v-for="movie in filteredResults"
          :key="movie.id"
          :movie="movie"
          @detail="openDetail"
        />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { Movie } from '@/types/movie';
import Loading from '@/components/Loading.vue';
import MovieCard from '@/components/common/MovieCard.vue';
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import { fetchMovies, TMDB_ENDPOINTS } from '@/api/tmdb';
import { tmdbClient } from '@/api/tmdb/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { readJSON, writeJSON } from '@/utils/storage';

type SortOption = 'relevance' | 'recent' | 'rating' | 'title';
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
const results = ref<Movie[]>([]);
const recentSearches = ref<string[]>([]);
const activeRequestId = ref(0);
const debounceId = ref<number | null>(null);

const filters = reactive({
  sort: 'relevance' as SortOption,
  minScore: 0,
  onlyPoster: true,
  year: '' as string,
});

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'API 순서' },
  { value: 'recent', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'title', label: '제목순' },
];

const filteredResults = computed(() => {
  const year = filters.year.trim();
  let list = [...results.value];

  if (filters.onlyPoster) {
    list = list.filter((movie) => !!movie.poster_path);
  }

  if (filters.minScore > 0) {
    list = list.filter((movie) => (movie.vote_average ?? 0) >= filters.minScore);
  }

  if (year.length === 4) {
    list = list.filter((movie) => movie.release_date?.startsWith(year));
  }

  switch (filters.sort) {
    case 'rating':
      list.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
      break;
    case 'recent':
      list.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
      break;
    case 'title':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return list;
});

const scheduleSearch = () => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
  if (!query.value.trim()) {
    activeRequestId.value += 1;
    results.value = [];
    lastQueried.value = '';
    error.value = null;
    loading.value = false;
    return;
  }
  debounceId.value = window.setTimeout(() => triggerSearch(), 420);
};

watch(
  () => query.value,
  () => scheduleSearch()
);

onMounted(() => {
  recentSearches.value = readJSON<string[]>(STORAGE_KEYS.recentSearches, []);
});

onBeforeUnmount(() => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
});

const triggerSearch = async () => {
  if (debounceId.value) window.clearTimeout(debounceId.value);
  const term = query.value.trim();
  if (!term) return;

  const requestId = ++activeRequestId.value;
  loading.value = true;
  error.value = null;

  try {
    const data = await fetchMovies(TMDB_ENDPOINTS.search, {
      query: term,
      include_adult: 'false',
      page: 1,
    });
    if (requestId !== activeRequestId.value) return;
    results.value = data;
    lastQueried.value = term;
    pushRecent(term);
  } catch (e) {
    console.error(e);
    if (requestId !== activeRequestId.value) return;
    error.value = '검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
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
  results.value = [];
  lastQueried.value = '';
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
    detailError.value = '상세 정보를 불러오지 못했어요. 다시 시도해주세요.';
  } finally {
    detailLoading.value = false;
  }
};

const closeDetail = () => {
  showDetail.value = false;
};
</script>

<style scoped>
.search-page {
  display: grid;
  gap: 18px;
  margin-top: 4px;
}

.search-hero {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.14), rgba(17, 17, 24, 0.92));
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
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
}

.input-wrap i {
  color: #cbd3e8;
}

.input-wrap .clear {
  border: none;
  background: transparent;
  color: #cbd3e8;
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
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.search-btn:disabled {
  opacity: 0.7;
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
}

.filter-group {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.filter-group.inline {
  grid-template-columns: auto auto;
  align-items: center;
  gap: 6px;
}

.label {
  font-weight: 700;
  color: #cbd3e8;
  font-size: 0.9rem;
}

.pill-group {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border 0.2s ease;
}

.pill.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f6f6f6;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.pill.active {
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(255, 61, 90, 0.28);
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

.filter-group input[type='range'] {
  accent-color: #ff3d5a;
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
  color: #ff9ca2;
  font-weight: 700;
}

.placeholder {
  margin: 0;
  color: #c6c6c6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.eyebrow {
  margin: 0;
  color: #9aa6c8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

@media (max-width: 768px) {
  .search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
