<template>
  <div class="app-shell">
    <Header />

    <main class="page-container">
      <Transition name="route-fade" mode="out-in">
        <RouterView />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue';
</script>

<style scoped>
.page-container {
  padding-top: 72px; /* 고정 헤더 높이 보정 */
}

/* 라우터 전환 애니메이션 */
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
