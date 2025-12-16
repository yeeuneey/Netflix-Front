<!-- src/components/Header.vue -->
<template>
  <header :class="['main-header', { scrolled: isScrolled }]">
    <div class="brand" @click="go('/')">
      <i class="fas fa-film logo-icon"></i>
      <span class="logo-text">YENFLIX</span>
    </div>

    <nav class="nav-center">
      <div class="nav-links">
        <button
          v-for="link in navLinks"
          :key="link.path"
          @click="go(link.path)"
          :class="{ active: route.path === link.path }"
        >
          {{ link.label }}
        </button>
      </div>
    </nav>

    <div class="actions" v-if="!isAuthPage">
      <template v-if="!isLoggedIn">
        <button class="ghost" @click="go('/signin')">
          <i class="fas fa-user"></i>
          <span>Login</span>
        </button>
      </template>
      <template v-else>
        <span class="user-id">
          <i class="far fa-circle-user"></i>
          {{ currentUser?.id || 'Guest' }}
        </span>
        <button class="ghost" @click="logout">
          <i class="fas fa-right-from-bracket"></i>
          <span>로그아웃</span>
        </button>
      </template>
      <button class="menu-btn" type="button" aria-label="메뉴 열기" @click="toggleMenu">
        <i class="fas fa-bars"></i>
      </button>
      <div v-if="isMenuOpen" class="menu-dropdown">
        <button
          v-for="link in navLinks"
          :key="link.path"
          type="button"
          :class="{ active: route.path === link.path }"
          @click="goAndClose(link.path)"
        >
          {{ link.label }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { logout as logoutUtil } from '@/utils/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isLoggedIn, currentUser } = storeToRefs(authStore);

const navLinks = [
  { path: '/', label: '메인' },
  { path: '/popular', label: '대세 콘텐츠' },
  { path: '/search', label: '찾아보기' },
  { path: '/wishlist', label: '내가 찜한 리스트' },
];

const isScrolled = ref(false);
const isAuthPage = computed(() => route.path === '/signin');
const isMenuOpen = ref(false);

const go = (path: string) => router.push(path);
const goAndClose = (path: string) => {
  isMenuOpen.value = false;
  router.push(path);
};
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const logout = () => {
  logoutUtil();
  authStore.refreshFromStorage();
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
  min-height: 68px;
  padding: 12px 1.15rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(10px);
  color: #f8f8f8;
  z-index: 120;
  transition: background 0.25s ease, box-shadow 0.25s ease, padding 0.25s ease, grid-template-columns 0.25s ease;
}
.main-header.scrolled {
  background: rgba(11, 11, 15, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  flex: 0 0 auto;
  z-index: 2;
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

.nav-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  width: 100%;
}
.nav-links {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.25rem 0.5rem;
  max-width: 100%;
}
.nav-links::-webkit-scrollbar {
  display: none;
}
.nav-links button {
  border: none;
  background: transparent;
  color: #f0f0f0;
  font-size: 0.95rem;
  padding: 0.32rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}
.nav-links button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e50914;
  transform: translateY(-1px);
}
.nav-links button.active {
  background: #e50914;
  color: #fff;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  z-index: 2;
  position: relative;
  flex-wrap: wrap;
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  color: #f8f8f8;
  cursor: pointer;
}
.menu-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #e50914;
}

.menu-dropdown {
  position: absolute;
  top: 58px;
  right: 12px;
  min-width: 180px;
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(12, 12, 16, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
}
.menu-dropdown button {
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: #f6f6f6;
  border-radius: 12px;
  padding: 11px 12px;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.menu-dropdown button.active {
  background: #e50914;
  color: #ffffff;
}
.menu-dropdown button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0 0.8rem;
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(248, 248, 248, 0.28);
  background: rgba(255, 255, 255, 0.06);
  color: #f8f8f8;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #e50914;
  color: #e50914;
  transform: translateY(-1px);
}
.user-id {
  font-size: 0.9rem;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 120px;
  max-width: min(360px, 60vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 12px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(248, 248, 248, 0.18);
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 1100px) {
  .main-header {
    padding: 10px 0.85rem;
    grid-template-columns: auto 1fr auto;
  }
  .nav-links button {
    font-size: 0.9rem;
    padding: 0.28rem 0.7rem;
  }
}

@media (max-width: 900px) {
  .main-header {
    padding: 10px 0.65rem;
  }
  .nav-links {
    display: none;
  }
  .menu-btn {
    display: inline-flex;
  }
  .user-id {
    display: inline-flex;
    font-size: 0.8rem;
    max-width: min(320px, 80vw);
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .logo-text {
    font-size: 1.05rem;
  }
  .nav-links button {
    font-size: 0.85rem;
  }
  .ghost span {
    display: none;
  }
  .ghost {
    padding: 0.3rem 0.55rem;
  }
}
</style>
