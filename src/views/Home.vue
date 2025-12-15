<template>
  <div class="home">
    <section v-if="hero" class="hero" :style="heroStyle">
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <p class="hero__label">NEW! 이번 주 트렌딩</p>
        <h1 class="hero__title">{{ hero.title }}</h1>
        <p class="hero__desc">
          {{ hero.overview || '줄거리가 준비되지 않았어요.' }}
        </p>
        <div class="hero__meta">
          <span v-if="hero.release_date">{{ hero.release_date.slice(0, 4) }}</span>
          <span v-if="hero.vote_average">평점 {{ hero.vote_average?.toFixed(1) }}</span>
        </div>
        <div class="hero__actions">
          <button type="button" class="btn info" :disabled="detailLoading" @click="handleHeroDetail">
            <i class="fa-solid fa-circle-info"></i>
            상세 정보
          </button>
        </div>
      </div>
    </section>

    <div class="section-block">
      <MovieSection
        title="지금 뜨는 영화 TOP 20"
        :movies="trending"
        :loading="loading.trending"
        :show-rank="true"
      />
      <p v-if="error.trending" class="error-text">{{ error.trending }}</p>
    </div>

    <div class="section-block">
      <MovieSection
        title="현재 상영작"
        :movies="nowPlaying"
        :loading="loading.nowPlaying"
      />
      <p v-if="error.nowPlaying" class="error-text">{{ error.nowPlaying }}</p>
    </div>

    <div class="section-block">
      <MovieSection
        title="평점 상위 TOP 20"
        :movies="topRated"
        :loading="loading.topRated"
        :show-rank="true"
      />
      <p v-if="error.topRated" class="error-text">{{ error.topRated }}</p>
    </div>

    <div class="section-block">
      <MovieSection
        title="인기 급상승"
        :movies="popular"
        :loading="loading.popular"
      />
      <p v-if="error.popular" class="error-text">{{ error.popular }}</p>
    </div>

    <div class="section-block">
      <MovieSection
        title="개봉 예정작"
        :movies="upcoming"
        :loading="loading.upcoming"
      />
      <p v-if="error.upcoming" class="error-text">{{ error.upcoming }}</p>
    </div>

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
import { computed, onMounted, reactive, ref } from 'vue';
import type { Movie } from '@/types/movie';
import MovieSection from '@/components/home/MovieSection.vue';
import { fetchMovies, TMDB_ENDPOINTS } from '@/api/tmdb';
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import { tmdbClient } from '@/api/tmdb/client';

const trending = ref<Movie[]>([]);
const nowPlaying = ref<Movie[]>([]);
const topRated = ref<Movie[]>([]);
const popular = ref<Movie[]>([]);
const upcoming = ref<Movie[]>([]);

const loading = reactive({
  trending: true,
  nowPlaying: true,
  topRated: true,
  popular: true,
  upcoming: true,
});

const error = reactive<Record<keyof typeof loading, string | null>>({
  trending: null,
  nowPlaying: null,
  topRated: null,
  popular: null,
  upcoming: null,
});

type MovieDetail = {
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  cast?: { name: string; character?: string }[];
};

const loadSection = async (key: keyof typeof loading, target: typeof trending, path: string) => {
  loading[key] = true;
  error[key] = null;
  try {
    target.value = await fetchMovies(path);
  } catch (e) {
    console.error(e);
    error[key] = '영화 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
  } finally {
    loading[key] = false;
  }
};

onMounted(async () => {
  await Promise.all([
    loadSection('trending', trending, TMDB_ENDPOINTS.trendingWeek),
    loadSection('nowPlaying', nowPlaying, TMDB_ENDPOINTS.nowPlaying),
    loadSection('topRated', topRated, TMDB_ENDPOINTS.topRated),
    loadSection('popular', popular, TMDB_ENDPOINTS.popular),
    loadSection('upcoming', upcoming, TMDB_ENDPOINTS.upcoming),
  ]);
});

const hero = computed(() => trending.value[0]);
const heroStyle = computed(() => {
  if (!hero.value) return {};
  const src = hero.value.backdrop_path || hero.value.poster_path;
  if (!src) return {};
  return {
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.65) 100%), url(https://image.tmdb.org/t/p/original${src})`,
  };
});

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
    detailError.value = '상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
  } finally {
    detailLoading.value = false;
  }
};

const handleHeroDetail = () => {
  if (hero.value) openDetail(hero.value);
};

const closeDetail = () => {
  showDetail.value = false;
};
</script>

<style scoped>
.home {
  margin-top: 8px;
  display: grid;
  gap: 22px;
}

.hero {
  position: relative;
  min-height: clamp(340px, 55vw, 520px);
  border-radius: 16px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  isolation: isolate;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

.section-block {
  display: grid;
  gap: 6px;
}

.error-text {
  margin: 0;
  color: #ff9ca2;
  font-weight: 700;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.8) 100%);
  z-index: 1;
}

.hero__content {
  position: relative;
  z-index: 2;
  padding: clamp(22px, 4vw, 32px) clamp(18px, 4vw, 28px);
  max-width: min(640px, 70vw);
  display: grid;
  gap: 12px;
}

.hero__label {
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffb3c0;
}

.hero__title {
  margin: 0;
  font-size: clamp(28px, 5vw, 42px);
  line-height: 1.1;
}

.hero__desc {
  margin: 0;
  color: #e0e0e0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero__meta {
  display: flex;
  gap: 10px;
  color: #f3f3f3;
  font-weight: 700;
}

.hero__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.btn.info {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

@media (max-width: 1024px) {
  .home {
    gap: 18px;
    margin-top: 6px;
  }
  .hero__content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .home {
    margin-top: 4px;
  }
  .hero {
    min-height: 360px;
    border-radius: 14px;
  }
  .hero__desc {
    -webkit-line-clamp: 4;
  }
}

@media (max-width: 560px) {
  .home {
    gap: 14px;
    margin-top: 2px;
  }
  .hero {
    min-height: 320px;
    align-items: flex-end;
  }
  .hero__content {
    padding: 18px 14px 20px;
    gap: 10px;
  }
  .hero__title {
    font-size: clamp(24px, 8vw, 28px);
  }
  .hero__actions {
    gap: 8px;
  }
  .btn {
    padding: 9px 14px;
  }
}
</style>
