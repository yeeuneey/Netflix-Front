<template>
  <div class="popular-page">
    <header class="page-header">
      <div class="title-block">
        <p class="eyebrow">ROUTE /popular</p>
        <h1>대세 콘텐츠 (Infinite Scroll)</h1>
        <p class="lede">
          페이지네이션 없이 스크롤을 끝까지 내리면 자동으로 다음 인기 영화 페이지를 불러옵니다.
        </p>
        <div class="badges">
          <span class="badge">Infinite scroll</span>
          <span class="badge">Auto load</span>
          <span class="badge">Top button</span>
        </div>
      </div>

      <div class="status-card">
        <p class="label">현재 상태</p>
        <p class="value">{{ statusText }}</p>
        <div class="meta-row">
          <span>불러온 영화: {{ movies.length }}</span>
          <span v-if="!hasMore">모든 페이지 로드 완료</span>
        </div>
        <div class="actions">
          <button type="button" class="pill ghost" :disabled="!canScrollTop" @click="scrollToTop">
            Top으로 이동
          </button>
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
          <h2>무한 스크롤 리스트</h2>
          <p class="desc">스크롤 끝에 닿으면 다음 TMDB 인기 영화 페이지를 자동으로 이어붙입니다.</p>
        </div>
      </div>

      <div class="movies-grid">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
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

      <div ref="sentinel" class="sentinel" aria-hidden="true"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import MovieCard from '@/components/MovieCard.vue';
import type { Movie } from '@/types/movie';
import { fetchMoviesPage } from '@/api/tmdb';

const movies = ref<Movie[]>([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const error = ref<string | null>(null);
const sentinel = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const canScrollTop = ref(false);

const statusText = computed(() => {
  if (error.value) return '로드 실패';
  if (loading.value) return '불러오는 중...';
  return hasMore.value ? `페이지 ${page.value - 1}까지 불러옴` : '모든 페이지 완료';
});

const isSentinelVisible = () => {
  const el = sentinel.value;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
};

const maybeLoadMoreIfVisible = () => {
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
    const data = await fetchMoviesPage('/movie/popular', { page: page.value });
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

onMounted(() => {
  loadNext();
  setupObserver();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect();
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.popular-page {
  margin-top: 80px;
  display: grid;
  gap: 18px;
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

.panel-header .desc {
  margin: 0;
  color: #cbd3e8;
}

.movies-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
}
</style>
