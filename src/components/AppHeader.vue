<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const links = [
  { to: '/', label: 'Home' },
  { to: '/popular', label: 'Popular' },
  { to: '/search', label: 'Search' },
  { to: '/wishlist', label: 'Wishlist' },
]

const route = useRoute()
const isLoggedIn = computed(() => false)
</script>

<template>
  <header class="app-header">
    <div class="logo-wrap">
      <span class="logo-mark">NF</span>
      <div class="logo-text">
        <p class="logo-title">NetFlex</p>
        <p class="logo-sub">demo</p>
      </div>
    </div>
    <nav class="nav">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        class="nav-link"
        :class="{ active: route.path === link.to }"
        :to="link.to"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
    <div class="actions">
      <button type="button" class="icon-btn" title="Search">Search</button>
      <button
        v-if="isLoggedIn"
        type="button"
        class="pill-btn ghost"
        title="Account"
      >
        Profile
      </button>
      <RouterLink v-else class="pill-btn primary" to="/signin" title="Login">
        Login
      </RouterLink>
    </div>
  </header>
</template>
