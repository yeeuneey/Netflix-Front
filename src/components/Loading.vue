<!-- src/components/Loading.vue -->
<template>
  <div class="loading">
    <div class="spinner"></div>
    <span class="text">검색된 영화를 불러오는 중이에요...</span>
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
.text {
  font-weight: 700;
  letter-spacing: 0.01em;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
