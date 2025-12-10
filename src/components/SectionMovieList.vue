<template>
  <section class="section">
    <div class="section__header">
      <h2>{{ title }}</h2>
    </div>

    <Loading v-if="loading" />

    <div v-else class="slider">
      <button
        class="nav-btn prev"
        type="button"
        aria-label="이전"
        @click="scroll(-1)"
      >
        ‹
      </button>

      <div class="slider-window" ref="viewport" @scroll="updateNav">
        <div class="movie-track" ref="track">
          <MovieCard
            v-for="(m, idx) in loopedMovies"
            :key="`${m.id}-${idx}`"
            :movie="m"
          />
        </div>
      </div>

      <button
        class="nav-btn next"
        type="button"
        aria-label="다음"
        @click="scroll(1)"
      >
        ›
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMovies } from '@/composables/useMovies';
import MovieCard from './MovieCard.vue';
import Loading from './Loading.vue';

const props = defineProps<{
  title: string;
  path: string;
}>();

const { movies, error, loading, load } = useMovies(props.path);

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const loopCount = ref(1);
const canPrev = ref(false);
const canNext = ref(false);

const loopedMovies = computed(() => {
  const count = Math.max(1, loopCount.value);
  if (!movies.value.length) return [];
  const head = movies.value.slice(-count);
  const tail = movies.value.slice(0, count);
  return [...head, ...movies.value, ...tail];
});

const getStep = () => {
  const list = track.value;
  if (!list) return 0;
  const firstCard = list.querySelector<HTMLElement>('.movie-card');
  const gap =
    parseFloat(getComputedStyle(list).columnGap || getComputedStyle(list).gap || '0') || 0;
  const cardWidth = firstCard?.clientWidth || 0;
  return cardWidth + gap;
};

const measureVisible = () => {
  const view = viewport.value;
  const step = getStep();
  if (!view || !step) return;
  const perView = Math.max(1, Math.floor(view.clientWidth / step));
  loopCount.value = perView;
};

const syncToReal = () => {
  const view = viewport.value;
  const step = getStep();
  if (!view || !step || !movies.value.length) return;
  view.scrollLeft = step * loopCount.value;
  updateNav();
};

const handleLoop = () => {
  const view = viewport.value;
  const step = getStep();
  const total = movies.value.length;
  if (!view || !step || !total) return;

  const prefix = loopCount.value * step;
  const realSpan = total * step;
  const tailStart = prefix + realSpan;
  const x = view.scrollLeft;

  // when reaching cloned head/tail, jump back into real list span
  if (x >= tailStart) {
    view.scrollLeft = x - realSpan;
  } else if (x <= prefix - step) {
    view.scrollLeft = x + realSpan;
  }
};

const updateNav = () => {
  handleLoop();
  const el = viewport.value;
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const overflow = scrollWidth > clientWidth + 8;
  canPrev.value = overflow && scrollLeft >= 0;
  canNext.value = overflow && scrollLeft <= scrollWidth;
};

const scroll = (direction: 1 | -1) => {
  const view = viewport.value;
  const list = track.value;
  if (!view || !list) return;

  const step = getStep();
  if (!step) return;
  const perView = Math.max(1, Math.floor(view.clientWidth / step));
  const amount = step * perView;

  view.scrollBy({ left: amount * direction, behavior: 'smooth' });
  // optimistic state update
  requestAnimationFrame(() => requestAnimationFrame(updateNav));
};

const handleResize = () => updateNav();

onMounted(async () => {
  await load();
  await nextTick();
  measureVisible();
  await nextTick();
  syncToReal();
  updateNav();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(
  () => movies.value.length,
  async (len) => {
    if (!len) return;
    await nextTick();
    measureVisible();
    await nextTick();
    syncToReal();
    updateNav();
  },
);
</script>

<style scoped>
.section {
  padding: 20px 0;
  position: relative;
}
.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.slider {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.slider-window {
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 4px 14px;
  scroll-snap-type: x mandatory;
  overscroll-behavior-inline: contain;
}

.movie-track {
  display: flex;
  gap: 14px;
  padding: 4px 6px 8px;
  scroll-snap-type: x mandatory;
}
.movie-track > * {
  scroll-snap-align: start;
}
.slider-window::-webkit-scrollbar {
  height: 6px;
}
.slider-window::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  min-width: 24px;
  min-height: 70px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease, opacity 0.2s ease, background 0.2s ease;
  font-size: 50px;
  line-height: 1;
}
.nav-btn:hover {
  transform: translateY(0px) scale(1.25);
  color: hsl(0, 100%, 50%);
}
.nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
  transform: none;
}
.nav-btn.prev {
  margin-right: 8px;
}
.nav-btn.next {
  margin-left: 8px;
}

.error {
  color: #ff4444;
}

@media (max-width: 768px) {
  .section {
    padding: 16px 0;
  }
  .slider {
    grid-template-columns: 1fr;
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
