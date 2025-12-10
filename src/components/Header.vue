<!-- src/components/Header.vue -->
<template>
  <header :class="['main-header', { scrolled: isScrolled }]">
    <div class="left" @click="go('/')">
      <i class="fas fa-film logo-icon"></i>
      <span class="logo-text">YENFLIX</span>
    </div>

    <nav class="nav-links">
      <button @click="go('/')" :class="{ active: route.path === '/' }">Home</button>
      <button @click="go('/popular')" :class="{ active: route.path === '/popular' }">
        Popular
      </button>
      <button @click="go('/search')" :class="{ active: route.path === '/search' }">
        Search
      </button>
      <button @click="go('/wishlist')" :class="{ active: route.path === '/wishlist' }">
        Wishlist
      </button>
    </nav>

    <div class="auth">
      <template v-if="!user">
        <button class="ghost" @click="go('/signin')">
          <i class="fas fa-user"></i>
          <span>Login</span>
        </button>
      </template>
      <template v-else>
        <span class="user-id">
          <i class="far fa-circle-user"></i>
          {{ user.email }}
        </span>
        <button class="ghost" @click="logout">
          <i class="fas fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isScrolled = ref(false);
const user = ref<{ email: string } | null>(
  JSON.parse(localStorage.getItem('user') || 'null')
);

const go = (path: string) => router.push(path);

const logout = () => {
  localStorage.removeItem('user');
  user.value = null;
  router.push('/signin');
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<style scoped>
.main-header {
  position: fixed;
  top: 0;
  inset-inline: 0;
  height: 64px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(
    90deg,
    rgba(10, 10, 20, 0.9),
    rgba(20, 0, 40, 0.9)
  );
  backdrop-filter: blur(8px);
  color: #f8f8f8;
  z-index: 40;
  transition: background 0.25s ease, height 0.25s ease, box-shadow 0.25s ease;
}
.main-header.scrolled {
  height: 56px;
  background: rgba(4, 4, 10, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.55);
}

.left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}
.logo-icon {
  font-size: 1.4rem;
  color: #ff3366;
}
.logo-text {
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
}

.nav-links {
  display: flex;
  gap: 0.75rem;
}
.nav-links button {
  border: none;
  background: transparent;
  color: #f0f0f0;
  font-size: 0.9rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.nav-links button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}
.nav-links button.active {
  background: #ff3366;
  color: #fff;
}

.auth {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(248, 248, 248, 0.4);
  background: rgba(255, 255, 255, 0.03);
  color: #f8f8f8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #fff;
  transform: translateY(-1px);
}
.user-id {
  font-size: 0.8rem;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* 반응형 */
@media (max-width: 1100px) {
  .main-header {
    padding: 0 1.1rem;
  }
  .nav-links {
    gap: 0.5rem;
  }
  .nav-links button {
    font-size: 0.85rem;
    padding: 0.3rem 0.7rem;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .logo-text {
    display: none;
  }
}
</style>
