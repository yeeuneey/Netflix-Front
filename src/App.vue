<template>
  <div class="app-shell">
    <Header v-if="!isSignin" />

    <main class="page-container" :class="{ 'no-header': isSignin }">
      <Transition name="route-fade" mode="out-in">
        <RouterView />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/Header.vue';

const route = useRoute();
const isSignin = computed(() => route.path === '/signin');
</script>

<style scoped>
.page-container {
  padding-top: 76px;
}

.page-container.no-header {
  padding-top: 0;
}

@media (max-width: 1024px) {
  .page-container {
    padding-top: 68px;
  }
}

@media (max-width: 640px) {
  .page-container {
    padding-top: 60px;
  }
}

/* 라우트 전환 애니메이션 */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
