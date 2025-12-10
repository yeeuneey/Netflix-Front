<template>
  <div class="home">
    <section v-if="hero" class="hero" :style="heroStyle">
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <p class="hero__label">NEW! 대세 콘텐츠</p>
        <h1 class="hero__title">{{ hero.title }}</h1>
        <p class="hero__desc">
          {{ hero.overview || '영화 상세 설명 로딩 중입니다...' }}
        </p>
        <div class="hero__meta">
          <span v-if="hero.release_date">{{ hero.release_date.slice(0, 4) }}</span>
          <span v-if="hero.vote_average">★ {{ hero.vote_average?.toFixed(1) }}</span>
        </div>
        <div class="hero__actions">
          <button type="button" class="btn play">
            <i class="fa-solid fa-play"></i>
            재생
          </button>
          <button type="button" class="btn info">
            <i class="fa-solid fa-circle-info"></i>
            상세 정보
          </button>
        </div>
      </div>
    </section>

    <SectionMovieList
      title="🔥 Trending Now"
      path="/trending/movie/week"
    />

    <SectionMovieList
      title="🎬 Popular Movies"
      path="/movie/popular"
    />

    <SectionMovieList
      title="⭐ Top Rated Movies"
      path="/movie/top_rated"
    />

    <SectionMovieList
      title="📅 Upcoming Movies"
      path="/movie/upcoming"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMovies } from '@/composables/useMovies'
import SectionMovieList from '@/components/SectionMovieList.vue'

const { movies: heroMovies, load: loadHero } = useMovies('/trending/movie/week')

onMounted(() => loadHero())

const hero = computed(() => heroMovies.value[0])
const heroStyle = computed(() => {
  if (!hero.value) return {}
  const src = hero.value.backdrop_path || hero.value.poster_path
  if (!src) return {}
  return {
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.65) 100%), url(https://image.tmdb.org/t/p/original${src})`,
  }
})
</script>

<style scoped>
.home {
  margin-top: 90px; /* header height offset */
}
</style>

<style scoped>
.home {
  margin-top: 72px;
  display: grid;
  gap: 16px;
}

.hero {
  position: relative;
  min-height: 420px;
  border-radius: 16px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  isolation: isolate;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
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
  padding: 32px 28px;
  max-width: 640px;
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

.btn.play {
  background: #fff;
  color: #000;
}

.btn.info {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

@media (max-width: 768px) {
  .hero {
    min-height: 360px;
  }
  .hero__content {
    padding: 22px 18px;
  }
}
</style>
