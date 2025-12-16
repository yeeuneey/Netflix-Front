<!-- src/components/Loading.vue -->
<template>
  <div class="loading">
    <i class="fa-solid fa-spinner fa-spin"></i>
    <span class="text">Loading...</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.5rem;
  color: #f5f5f5;
}
.text {
  font-weight: 700;
  letter-spacing: 0.01em;
}
</style>
