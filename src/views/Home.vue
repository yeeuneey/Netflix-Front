<template>
  <div class="home">
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
import SectionMovieList from '@/components/SectionMovieList.vue'
</script>

<style scoped>
.home {
  margin-top: 90px; /* header height offset */
}
</style>