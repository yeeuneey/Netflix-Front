<!-- src/components/Header.vue -->
<template>
  <header :class="['main-header', { scrolled: isScrolled }]">
    <div class="left">
      <div class="brand" @click="go('/')">
        <i class="fas fa-film logo-icon"></i>
        <span class="logo-text">YENFLIX</span>
      </div>
      <nav class="nav-links">
        <button @click="go('/')" :class="{ active: route.path === '/' }">메인</button>
        <button @click="go('/popular')" :class="{ active: route.path === '/popular' }">
          대세 콘텐츠
        </button>
        <button @click="go('/search')" :class="{ active: route.path === '/search' }">
          찾아보기
        </button>
        <button @click="go('/wishlist')" :class="{ active: route.path === '/wishlist' }">
          내가 찜한 리스트
        </button>
      </nav>
    </div>

    <div class="actions">
      <button class="icon-btn" aria-label="알림">
        <i class="fas fa-bell"></i>
      </button>
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
  JSON.parse(localStorage.getItem('user') || 'null'),
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
  height: 56px;
  padding: 0 1.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(10px);
  color: #f8f8f8;
  z-index: 40;
  transition: background 0.25s ease, height 0.25s ease, box-shadow 0.25s ease;
}
.main-header.scrolled {
  height: 56px;
  background: rgba(11, 11, 15, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}
.logo-icon {
  font-size: 1.5rem;
  color: #e50914;
}
.logo-text {
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 1.25rem;
  color: #e50914;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}
.nav-links button {
  border: none;
  background: transparent;
  color: #f0f0f0;
  font-size: 0.9rem;
  padding: 0.34rem 0.88rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.nav-links button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e50914;
  transform: translateY(-1px);
}
.nav-links button.active {
  background: linear-gradient(135deg, #ff3b3b, #e50914 70%, #ff6a6a);
  color: #fff;
  box-shadow: 0 8px 18px rgba(229, 9, 20, 0.4);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: #f8f8f8;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.icon-btn:hover {
  background: rgba(229, 9, 20, 0.22);
  border-color: #e50914;
  transform: translateY(-1px);
}

.ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(248, 248, 248, 0.35);
  background: rgba(255, 255, 255, 0.06);
  color: #f8f8f8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #e50914;
  color: #e50914;
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
    padding: 0 1rem;
  }
  .nav-links {
    gap: 0.5rem;
  }
  .nav-links button {
    font-size: 0.85rem;
    padding: 0.32rem 0.75rem;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
    padding: 0 0.25rem;
  }
  .nav-links button {
    font-size: 0.85rem;
    padding: 0.25rem 0.6rem;
    white-space: nowrap;
  }
  .logo-text {
    display: inline;
    font-size: 1.05rem;
  }
}
</style>
