<!-- src/components/Loading.vue -->
<template>
  <div class="loading">
    <div class="spinner"></div>
    <span>...</span>
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
.spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ff3366;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
