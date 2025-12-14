<template>
  <div class="backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <header class="modal__header">
        <div>
          <p class="eyebrow">상세 정보</p>
          <h2 class="title">{{ movie.title }}</h2>
        </div>
        <button type="button" class="close-btn" aria-label="닫기" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div class="modal__body">
        <div class="poster">
          <img :src="posterUrl" :alt="`${movie.title} 포스터`" loading="lazy" />
        </div>

        <div class="content">
          <p class="overview">
            {{ detail?.overview || movie.overview || '줄거리가 준비되지 않았어요.' }}
          </p>

          <div class="meta-grid">
            <div>
              <p class="label">개봉</p>
              <p class="value">{{ detail?.release_date || movie.release_date || '정보 없음' }}</p>
            </div>
            <div>
              <p class="label">상영 시간</p>
              <p class="value">{{ runtimeText }}</p>
            </div>
            <div>
              <p class="label">국가</p>
              <p class="value">{{ countryText }}</p>
            </div>
            <div>
              <p class="label">장르</p>
              <p class="value">{{ genreText }}</p>
            </div>
          </div>

          <div v-if="castText" class="section">
            <p class="label">출연</p>
            <p class="value">{{ castText }}</p>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-else-if="loading" class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            불러오는 중...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Movie } from '@/types/movie';

type MovieDetail = {
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  cast?: { name: string; character?: string }[];
};

const props = defineProps<{
  movie: Movie;
  detail: MovieDetail | null;
  loading: boolean;
  error: string | null;
}>();

defineEmits<{ (e: 'close'): void }>();

const posterUrl = computed(() => {
  if (!props.movie.poster_path) {
    return 'https://placehold.co/300x450/111827/EEE?text=No+Image';
  }
  return `https://image.tmdb.org/t/p/w500${props.movie.poster_path}`;
});

const runtimeText = computed(() => {
  if (!props.detail?.runtime) return '정보 없음';
  const h = Math.floor(props.detail.runtime / 60);
  const m = props.detail.runtime % 60;
  return h ? `${h}시간 ${m}분` : `${m}분`;
});

const regionDisplay =
  typeof Intl !== 'undefined' && // runtime safety
  // @ts-ignore TS may not include DisplayNames in lib target
  typeof Intl.DisplayNames !== 'undefined'
    ? // @ts-ignore
      new Intl.DisplayNames(['ko'], { type: 'region' })
    : null;

const countryText = computed(() => {
  const list = props.detail?.production_countries;
  if (!list?.length) return '정보 없음';
  return list
    .map((c) => {
      if (regionDisplay && c.iso_3166_1) {
        return regionDisplay.of(c.iso_3166_1) || c.name;
      }
      return c.name;
    })
    .join(', ');
});

const genreText = computed(() => {
  const list = props.detail?.genres;
  if (!list?.length) return '정보 없음';
  return list.map((g) => g.name).join(', ');
});

const castText = computed(() => {
  const list = props.detail?.cast;
  if (!list?.length) return '';
  return list
    .slice(0, 8)
    .map((c) => c.name)
    .join(', ');
});
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 200;
}

.modal {
  width: min(920px, 95vw);
  background: #0f0f11;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
  color: #f7f7f7;
  display: grid;
  gap: 14px;
  max-height: 90vh;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 0;
  gap: 10px;
}

.modal__body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  padding: 0 18px 18px;
  overflow: hidden;
}

.poster img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
}

.content {
  overflow: auto;
  padding-right: 8px;
  display: grid;
  gap: 12px;
}

.title {
  margin: 2px 0 0;
  font-size: 24px;
  letter-spacing: -0.02em;
}

.eyebrow {
  margin: 0;
  color: #9aa6c8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  font-weight: 700;
}

.overview {
  margin: 0;
  line-height: 1.6;
  color: #e8e8e8;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px 14px;
}

.section {
  display: grid;
  gap: 4px;
}

.label {
  margin: 0;
  color: #9aa6c8;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 700;
}

.value {
  margin: 2px 0 0;
  color: #f6f6f6;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error {
  color: #ff9ca2;
  margin: 0;
}

.loading {
  margin: 0;
  color: #cbd3e8;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.18s ease, background 0.2s ease, border-color 0.2s ease;
}
.close-btn:hover {
  transform: translateY(-1px);
  background: rgba(229, 9, 20, 0.22);
  border-color: #e50914;
}

@media (max-width: 768px) {
  .modal__body {
    grid-template-columns: 1fr;
  }
  .poster img {
    max-height: 320px;
    object-fit: cover;
  }
}
</style>
