<template>
  <section class="section">
    <div class="section__header">
      <h2>{{ title }}</h2>
      <button
        v-if="actionLabel"
        type="button"
        class="section__action"
        @click="handleAction"
      >
        <span class="icon">&#9654;</span>
        <span>{{ actionLabel }}</span>
      </button>
    </div>

    <Loading v-if="loading" />

    <div v-else class="slider">
      <button
        class="nav-btn prev"
        type="button"
        aria-label="이전"
        :disabled="!canPrev"
        @click="scroll(-1)"
      >
        &lsaquo;
      </button>

      <div class="slider-window" ref="viewport" @scroll="updateNav">
        <div class="movie-track" ref="track">
          <MovieCard
            v-for="(m, idx) in movies"
            :key="m.id"
            :movie="m"
            :rank="props.showRank ? getRank(idx) : undefined"
          />
        </div>
      </div>

      <button
        class="nav-btn next"
        type="button"
        aria-label="다음"
        :disabled="!canNext"
        @click="scroll(1)"
      >
        &rsaquo;
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMovies } from '@/composables/useMovies';
import MovieCard from './MovieCard.vue';
import Loading from './Loading.vue';

const props = defineProps<{
  title: string;
  path: string;
  actionLabel?: string;
  actionTo?: string;
  showRank?: boolean;
}>();
const emit = defineEmits<{
  (e: 'action'): void;
}>();

const router = useRouter();
const { movies, error, loading, load } = useMovies(props.path);

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const canPrev = ref(false);
const canNext = ref(false);
const snapTimer = ref<number | null>(null);

const getStep = () => {
  const list = track.value;
  if (!list) return 0;
  const firstCard = list.querySelector<HTMLElement>('.movie-card');
  const gap =
    parseFloat(getComputedStyle(list).columnGap || getComputedStyle(list).gap || '0') || 0;
  const cardWidth = firstCard?.clientWidth || 0;
  return cardWidth + gap;
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
  const jumpSize = Math.max(3, Math.ceil(perView * 1.6)); // jump multiple cards at once
  const amount = step * jumpSize;

  view.scrollBy({ left: amount * direction, behavior: 'smooth' });
};

const snapToNearest = () => {
  const view = viewport.value;
  const step = getStep();
  if (!view || !step) return;
  const target = Math.round(view.scrollLeft / step) * step;
  view.scrollTo({ left: target, behavior: 'smooth' });
};

const getRank = (idx: number) => {
  if (!movies.value.length) return null;
  return idx + 1;
};

const handleAction = () => {
  if (props.actionTo) {
    router.push(props.actionTo);
    return;
  }
  emit('action');
};

const handleResize = () => updateNav();

onMounted(async () => {
  await load();
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

watch(
  () => movies.value.length,
  async (len) => {
    if (!len) return;
    await nextTick();
    updateNav();
  },
);
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
.section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.section__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.section__action .icon {
  font-size: 12px;
}
.section__action:hover {
  background: #78787829;
  border-color: #ff000d;
  transform: translateY(-1px);
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
  padding: 10px 4px 12px;
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
  gap: 14px;
  padding: 2px 8px 8px;
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

.error {
  color: #ff4444;
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
