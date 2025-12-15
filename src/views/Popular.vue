<template>
  <div class="popular-page" :class="{ 'table-mode': viewMode === 'table' }">
    <header v-if="viewMode === 'infinite'" class="page-header">
      <div class="title-block">
        <p class="eyebrow">인기 만점!</p>
        <h1>대세 콘텐츠</h1>
        <p class="lede">
          자동으로 다음 인기 영화 페이지를 로딩합니다.
        </p>
        <div class="badges">
          <span class="badge">Infinite scroll</span>
          <span class="badge">Auto load</span>
        </div>
      </div>

      <div class="status-card">
        <p class="label">현재 상태</p>
        <p class="value">{{ statusText }}</p>
        <div class="meta-row">
          <span>로딩된 영화는 {{ movies.length }} 작품입니다.</span>
          <span v-if="!hasMore">모든 페이지 로드 완료</span>
        </div>
        <div class="actions">
          <button v-if="error" type="button" class="pill primary" @click="loadNext">
            다시 시도
          </button>
        </div>
      </div>
    </header>

    <section class="movies-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow small">Popular Movies</p>
          <h2 v-if="viewMode === 'infinite'">무한 스크롤 리스트</h2>
          <h2 v-else>테이블 리스트</h2>
          <p class="desc" v-if="viewMode === 'infinite'">자동 로딩으로 끊김 없는 탐색</p>
          <p class="desc" v-else>페이지네이션으로 정리된 탐색</p>
        </div>
        <div class="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            class="pill ghost"
            :class="{ active: viewMode === 'infinite' }"
            @click="setViewMode('infinite')"
          >
            Infinite Scroll
          </button>
          <button
            type="button"
            class="pill ghost"
            :class="{ active: viewMode === 'table' }"
            @click="setViewMode('table')"
          >
            Table View
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'infinite'" class="movies-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" @detail="openDetail" />
      </div>

      <div
        v-else
        ref="tableWrapper"
        class="table-wrapper"
        role="table"
        aria-label="Popular movies table"
      >
        <div ref="tableHead" class="table-head" role="rowgroup">
          <div class="table-row head" role="row">
            <div class="cell narrow" role="columnheader">#</div>
            <div class="cell title-col" role="columnheader">Title</div>
            <div class="cell" role="columnheader">Release</div>
            <div class="cell narrow" role="columnheader">Rating</div>
          </div>
        </div>
        <div class="table-body" role="rowgroup">
          <div
            v-for="(movie, idx) in displayedTableMovies"
            :key="movie.id"
            class="table-row"
            role="row"
          >
            <div class="cell narrow" role="cell">
              {{ (tablePage - 1) * tablePageSize + idx + 1 }}
            </div>
            <div class="cell title-col" role="cell">
              <div class="title-main">{{ movie.title }}</div>
              <div class="title-sub">{{ movie.overview }}</div>
              <button type="button" class="detail-pill" @click="openDetail(movie)">
                <i class="fa-solid fa-circle-info"></i>
                상세 정보
              </button>
            </div>
            <div class="cell" role="cell">{{ formatDate(movie.release_date) }}</div>
            <div class="cell narrow" role="cell">{{ formatScore(movie.vote_average) }}</div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'table'" ref="tablePagination" class="table-pagination">
        <button
          type="button"
          class="pill ghost nav-btn"
          :class="{ active: lastNav === 'prev' }"
          :disabled="!canGoPrev"
          @click="goPrevPage"
        >
          이전
        </button>
        <span class="page-indicator">페이지 {{ pageGroupLabel }}</span>
        <button
          type="button"
          class="pill ghost nav-btn"
          :class="{ active: lastNav === 'next' }"
          :disabled="!canGoNext"
          @click="goNextPage"
        >
          다음
        </button>
      </div>

      <div class="loader" v-if="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>
          다음 페이지 로딩 중
          <span class="dots" aria-hidden="true">...</span>
        </span>
      </div>

      <p class="error" v-if="error">{{ error }}</p>
      <p class="end" v-else-if="!hasMore">마지막 페이지까지 모두 로딩 완료했어요.</p>

      <div v-if="viewMode === 'infinite'" ref="sentinel" class="sentinel" aria-hidden="true"></div>
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
      aria-label="Top으로 이동"
      @click="scrollToTop"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import MovieCard from '@/components/common/MovieCard.vue';
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import type { Movie } from '@/types/movie';
import { fetchMoviesPage, TMDB_ENDPOINTS } from '@/api/tmdb';
import { tmdbClient } from '@/api/tmdb/client';

type ViewMode = 'table' | 'infinite';
const tablePageSize = ref(10);
const TABLE_ROW_HEIGHT = 132;
type MovieDetail = {
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  cast?: { name: string; character?: string }[];
};

const movies = ref<Movie[]>([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const error = ref<string | null>(null);
const sentinel = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const canScrollTop = ref(false);
const viewMode = ref<ViewMode>('infinite');
const tablePage = ref(1);
const tableWrapper = ref<HTMLElement | null>(null);
const tablePagination = ref<HTMLElement | null>(null);
const tableHead = ref<HTMLElement | null>(null);
const lastNav = ref<'prev' | 'next' | null>(null);
const showDetail = ref(false);
const detailLoading = ref(false);
const detailError = ref<string | null>(null);
const selectedMovie = ref<Movie | null>(null);
const detailData = ref<MovieDetail | null>(null);

const statusText = computed(() => {
  if (error.value) return '로드 실패';
  if (loading.value) return '불러오는 중...';
  return hasMore.value ? `페이지 ${page.value - 1}까지 로딩!` : '모든 페이지 완료';
});

const totalTablePages = computed(() => Math.max(1, Math.ceil(movies.value.length / tablePageSize.value)));

const displayedTableMovies = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize.value;
  return movies.value.slice(start, start + tablePageSize.value);
});

const canGoPrev = computed(() => tablePage.value > 1);
const canGoNext = computed(() => hasMore.value || tablePage.value < totalTablePages.value);
const pageGroupLabel = computed(() => `${tablePage.value} / ${totalTablePages.value}`);

const isSentinelVisible = () => {
  const el = sentinel.value;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
};

const maybeLoadMoreIfVisible = () => {
  if (viewMode.value !== 'infinite') return;
  if (!hasMore.value || loading.value) return;
  if (!isSentinelVisible()) return;
  requestAnimationFrame(() => {
    if (hasMore.value && !loading.value && isSentinelVisible()) {
      loadNext();
    }
  });
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadNext = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  error.value = null;
  const startedAt = performance.now();

  try {
    const data = await fetchMoviesPage(TMDB_ENDPOINTS.popular, { page: page.value });
    const results = data?.results ?? [];
    if (!results.length) {
      hasMore.value = false;
      return;
    }
    movies.value = [...movies.value, ...results];
    const isLast = data.page >= data.total_pages;
    hasMore.value = !isLast;
    page.value += 1;
  } catch (e) {
    console.error(e);
    error.value = '인기 영화 목록을 불러오지 못했습니다. 다시 시도해 주세요.';
  } finally {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, 2500 - elapsed);
    if (remaining) {
      await delay(remaining);
    }
    loading.value = false;
    if (viewMode.value === 'table') {
      await nextTick();
      recomputeTablePageSize();
    }
    maybeLoadMoreIfVisible();
  }
};

const setupObserver = () => {
  if (observer.value) observer.value.disconnect();
  if (!sentinel.value) return;

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadNext();
        }
      });
    },
    { root: null, threshold: 0, rootMargin: '200px 0px 200px 0px' }
  );

  observer.value.observe(sentinel.value);
};

const handleScroll = () => {
  canScrollTop.value = window.scrollY > 180;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const recomputeTablePageSize = () => {
  if (viewMode.value !== 'table') return;
  const wrapperRect = tableWrapper.value?.getBoundingClientRect();
  if (!wrapperRect) return;

  const paginationHeight = tablePagination.value?.offsetHeight ?? 0;
  const headHeight = tableHead.value?.offsetHeight ?? 0;
  const available =
    window.innerHeight - wrapperRect.top - paginationHeight - 32; // buffer for padding/gap
  const rowHeight = TABLE_ROW_HEIGHT;
  const spaceForRows = available - headHeight;
  const nextSize = Math.max(3, Math.floor(spaceForRows / rowHeight));

  if (nextSize !== tablePageSize.value) {
    tablePageSize.value = nextSize;
    tablePage.value = 1;
  }
};

const setScrollLock = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : '';
};

const setViewMode = async (mode: ViewMode) => {
  if (viewMode.value === mode) return;
  viewMode.value = mode;
  tablePage.value = 1;
  lastNav.value = null;

  if (mode === 'infinite') {
    setScrollLock(false);
    await nextTick();
    setupObserver();
    maybeLoadMoreIfVisible();
  } else if (observer.value) {
    observer.value.disconnect();
    setScrollLock(true);
    await nextTick();
    recomputeTablePageSize();
  }
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return date;
};

const formatScore = (score: number) => {
  if (!Number.isFinite(score)) return '-';
  return score.toFixed(1);
};

const ensureDataForPage = async (targetPage: number) => {
  const needed = targetPage * tablePageSize.value;
  if (movies.value.length < needed && hasMore.value) {
    await loadNext();
  }
};

const goPrevPage = () => {
  if (tablePage.value > 1) {
    tablePage.value -= 1;
    lastNav.value = 'prev';
  }
};

const goNextPage = async () => {
  if (!canGoNext.value) return;
  const targetPage = tablePage.value + 1;
  await ensureDataForPage(targetPage);
  const total = Math.max(1, Math.ceil(movies.value.length / tablePageSize.value));
  tablePage.value = Math.min(targetPage, total);
  lastNav.value = 'next';
};

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
    detailError.value = '상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
  } finally {
    detailLoading.value = false;
  }
};

const closeDetail = () => {
  showDetail.value = false;
};

onMounted(() => {
  setScrollLock(viewMode.value === 'table');
  loadNext();
  setupObserver();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', recomputeTablePageSize);
});

onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect();
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', recomputeTablePageSize);
  setScrollLock(false);
});
</script>

<style scoped>
.popular-page {
  margin-top: 0px;
  display: grid;
  gap: 12px;
}

.popular-page.table-mode {
  margin-top: 0px;
  gap: 12px;
}

.page-header {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  align-items: center;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: radial-gradient(circle at 20% 20%, rgba(255, 61, 90, 0.14), transparent 32%),
    radial-gradient(circle at 82% 0%, rgba(123, 109, 255, 0.14), transparent 26%),
    rgba(12, 14, 20, 0.92);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.title-block h1 {
  margin: 6px 0 8px;
  font-size: clamp(28px, 4vw, 36px);
  letter-spacing: -0.02em;
}

.lede {
  margin: 0 0 12px;
  color: #c4ccde;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 700;
  font-size: 0.85rem;
}

.status-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  gap: 8px;
}

.status-card .label {
  margin: 0;
  color: #cbd3e8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-card .value {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.status-card .meta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #cbd3e8;
}

.status-card .actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.movies-panel {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(12, 14, 20, 0.9);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  padding: 18px;
  display: grid;
  gap: 14px;
}

.panel-header h2 {
  margin: 4px 0 6px;
}

.popular-page.table-mode .panel-header {
  margin-bottom: 4px;
}

.panel-header .desc {
  margin: 0;
  color: #cbd3e8;
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.view-toggle .pill {
  min-width: 132px;
  justify-content: center;
}

.view-toggle .pill.active {
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(255, 61, 90, 0.28);
}

.movies-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.table-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.table-head,
.table-body {
  display: grid;
}

.table-row {
  display: grid;
  grid-template-columns: 64px 1fr 160px 100px;
  gap: 0;
  align-items: start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 132px;
}

.table-row.head {
  min-height: 0;
  height: 52px;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.head {
  background: rgba(255, 255, 255, 0.06);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.cell {
  padding: 12px 14px;
  color: #e6e8f0;
}

.cell.narrow {
  width: 100%;
  font-weight: 700;
  color: #cbd3e8;
}

.title-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.title-main {
  font-weight: 800;
  color: #ffffff;
}

.title-sub {
  color: #cbd3e8;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1 1 auto;
}

.detail-pill {
  margin-top: auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.detail-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.table-pagination {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.table-pagination .page-indicator {
  color: #e6e8f0;
  font-weight: 700;
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: #e50914;
  color: #e50914;
  box-shadow: none;
}

.loader,
.end,
.error {
  margin: 6px 0 0;
  color: #ff0019;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
}

.loader {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.dots {
  display: inline-block;
  width: 22px;
  text-align: left;
}

.dots::after {
  content: '...';
}

@keyframes dots {
  0% {
    width: 0;
  }
  25% {
    width: 7px;
  }
  50% {
    width: 14px;
  }
  75%,
  100% {
    width: 22px;
  }
}

.error {
  color: #ff9ca2;
}

.end {
  color: #9dd6a0;
}

.sentinel {
  height: 1px;
}

.top-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  box-shadow: 0 14px 30px rgba(255, 0, 38, 0.32);
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

.pill {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border 0.2s ease;
}

.pill.primary {
  background: linear-gradient(135deg, #ff3d5a, #ff7f66);
  color: #0b0c14;
  box-shadow: 0 10px 24px rgba(255, 61, 90, 0.28);
}

.pill.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f6f6f6;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.pill:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pill:hover:not(:disabled) {
  transform: translateY(-1px);
}

.load-more {
  width: fit-content;
  justify-self: center;
}

.eyebrow {
  margin: 0;
  color: #9aa6c8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.eyebrow.small {
  font-size: 0.8rem;
}

@media (max-width: 980px) {
  .page-header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .popular-page {
    margin-top: 68px;
  }

  .table-row {
    grid-template-columns: 48px 1fr;
  }

  .table-row .cell:nth-child(3),
  .table-row .cell:nth-child(4) {
    padding-top: 0;
    padding-bottom: 10px;
  }

  .top-button {
    right: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }
}
</style>
