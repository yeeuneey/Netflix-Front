<template>
  <section class="section-wrapper">
    <MovieSection
      :title="title"
      :movies="movies"
      :loading="loading"
      :show-rank="props.showRank"
    >
      <template #actions v-if="actionLabel">
        <button type="button" class="section__action" @click="handleAction">
          <span class="icon">&#9654;</span>
          <span>{{ actionLabel }}</span>
        </button>
      </template>
    </MovieSection>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMovies } from '@/composables/useMovies';
import MovieSection from '@/components/home/MovieSection.vue';

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

const handleAction = () => {
  if (props.actionTo) {
    router.push(props.actionTo);
    return;
  }
  emit('action');
};

onMounted(async () => {
  await load();
});
</script>

<style scoped>
.section-wrapper {
  padding: 16px 0;
  position: relative;
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

.error {
  color: #ff4444;
}
</style>
