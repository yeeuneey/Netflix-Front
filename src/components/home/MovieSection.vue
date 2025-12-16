<template>
  <section class="section">
    <div class="section__header">
      <h2>{{ title }}</h2>
      <div class="section__actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <Loading v-if="loading" />

    <p v-else-if="!movies.length" class="empty">표시할 영화가 없어요.</p>

    <div v-else class="slider">
      <button
        class="nav-btn prev"
        type="button"
        aria-label="이전으로"
        :disabled="!canPrev"
        @click="scroll(-1)"
      >
        &lsaquo;
      </button>

      <div class="slider-window" ref="viewport" @scroll="updateNav">
        <div class="movie-track" ref="track">
          <MovieCard
            v-for="(movie, idx) in movies"
            :key="movie.id"
            :movie="movie"
            :rank="showRank ? idx + 1 : undefined"
            @detail="openDetail"
          />
        </div>
      </div>

      <button
        class="nav-btn next"
        type="button"
        aria-label="다음으로"
        :disabled="!canNext"
        @click="scroll(1)"
      >
        &rsaquo;
      </button>
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
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Movie } from '@/types/movie';
import MovieCard from '@/components/common/MovieCard.vue';
import Loading from '@/components/Loading.vue';
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import { tmdbClient } from '@/api/tmdb/client';

const props = defineProps<{
  title: string;
  movies: Movie[];
  loading: boolean;
  showRank?: boolean;
}>();

type MovieDetail = {
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  cast?: { name: string; character?: string }[];
};

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const canPrev = ref(false);
const canNext = ref(false);
const snapTimer = ref<number | null>(null);
const showDetail = ref(false);
const detailLoading = ref(false);
const detailError = ref<string | null>(null);
const selectedMovie = ref<Movie | null>(null);
const detailData = ref<MovieDetail | null>(null);

const getStep = () => {
  const list = track.value;
  if (!list) return 0;
  const firstCard = list.querySelector<HTMLElement>('.movie-card');
  const styles = getComputedStyle(list);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  const cardWidth = firstCard?.clientWidth || 0;
  return cardWidth + gap;
};

const snapToNearest = () => {
  const view = viewport.value;
  const step = getStep();
  if (!view || !step) return;
  const target = Math.round(view.scrollLeft / step) * step;
  view.scrollTo({ left: target, behavior: 'smooth' });
};

const updateNav = () => {
  const el = viewport.value;
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const overflow = scrollWidth > clientWidth + 8;
  const maxScroll = scrollWidth - clientWidth;
  canPrev.value = overflow && scrollLeft > 0;
  canNext.value = overflow && scrollLeft < maxScroll;

  if (snapTimer.value) {
    window.clearTimeout(snapTimer.value);
  }
  snapTimer.value = window.setTimeout(() => {
    snapTimer.value = null;
    snapToNearest();
  }, 140);
};

const scroll = (direction: 1 | -1) => {
  const view = viewport.value;
  const list = track.value;
  if (!view || !list) return;

  const step = getStep();
  if (!step) return;
  const perView = Math.max(1, Math.floor(view.clientWidth / step));
  const jumpSize = Math.max(3, Math.ceil(perView * 1.6));
  const amount = step * jumpSize;

  view.scrollBy({ left: amount * direction, behavior: 'smooth' });
};

const handleResize = () => updateNav();

watch(
  () => props.movies.length,
  async (len) => {
    if (!len) return;
    await nextTick();
    updateNav();
  }
);

onMounted(async () => {
  await nextTick();
  updateNav();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (snapTimer.value) {
    window.clearTimeout(snapTimer.value);
  }
});

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
</script>

<style scoped>
.section {
  padding: 16px 0;
  position: relative;
}
.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.section__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.empty {
  margin: 4px 0 0;
  color: #c6c6c6;
}

.slider {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  --nav-offset: 64px;
  overflow: visible;
}
.slider::before,
.slider::after {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 68px;
  pointer-events: none;
  z-index: 3;
  transition: opacity 0.2s ease;
}
.slider::before {
  left: var(--nav-offset);
  background: linear-gradient(90deg, rgba(9, 9, 12, 0.92), rgba(9, 9, 12, 0));
}
.slider::after {
  right: var(--nav-offset);
  background: linear-gradient(270deg, rgba(9, 9, 12, 0.92), rgba(9, 9, 12, 0));
}

.slider-window {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 12px 12px;
  scroll-snap-type: x mandatory;
  overscroll-behavior-inline: contain;
  scroll-padding-inline: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}
.slider-window::-webkit-scrollbar {
  height: 4px;
}
.slider-window::-webkit-scrollbar-thumb {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(229, 9, 20, 0.35));
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.slider-window::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
}

.movie-track {
  display: flex;
  gap: 10px;
  padding: 2px 14px 8px 8px;
  scroll-snap-type: x mandatory;
}
.movie-track > * {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.nav-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  min-width: 46px;
  min-height: 86px;
  border: 0;
  background: rgba(16, 16, 18, 0.78);
  color: #f6f6f6;
  cursor: pointer;
  border-radius: 18px;
  backdrop-filter: blur(10px);
  transition: transform 0.18s ease, opacity 0.2s ease, box-shadow 0.22s ease,
    background 0.22s ease, color 0.18s ease;
  font-size: 36px;
  line-height: 1;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
  filter: drop-shadow(0 12px 26px rgba(0, 0, 0, 0.28));
  overflow: hidden;
  z-index: 2;
}
.nav-btn:hover {
  transform: translateY(-1px) scale(1.2);
  color: #ff3b3b;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.55), 0 10px 24px rgba(229, 9, 20, 0.16);
  filter: drop-shadow(0 14px 30px rgba(0, 0, 0, 0.32));
}
.nav-btn:active {
  transform: translateY(0px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.3));
}
.nav-btn:disabled {
  opacity: 0.45;
  cursor: default;
  transform: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.25));
}
.nav-btn.prev {
  margin-right: 8px;
}
.nav-btn.next {
  margin-left: 8px;
}

@media (max-width: 768px) {
  .section {
    padding: 16px 0;
  }
  .slider {
    grid-template-columns: 1fr;
    --nav-offset: 0px;
  }
  .nav-btn {
    display: none;
  }
  .movie-track {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .movie-track {
    gap: 8px;
  }
}
</style>
