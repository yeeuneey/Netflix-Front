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
        <button @click="go('/popular')" :class="{ active: route.path === '/popular' }">대세 콘텐츠</button>
        <button @click="go('/search')" :class="{ active: route.path === '/search' }">찾아보기</button>
        <button @click="go('/wishlist')" :class="{ active: route.path === '/wishlist' }">내가 찜한 리스트</button>
      </nav>
    </div>

    <div class="actions">
      <button class="icon-btn" aria-label="Alerts">
        <i class="fas fa-bell"></i>
      </button>
      <template v-if="!isLoggedIn">
        <button class="ghost" @click="go('/signin')">
          <i class="fas fa-user"></i>
          <span>로그인</span>
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { logout as logoutUtil } from '@/utils/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isLoggedIn, currentUser } = storeToRefs(authStore);

const isScrolled = ref(false);

const go = (path: string) => router.push(path);

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
  min-height: 64px;
  padding: 10px 1.15rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(10px);
  color: #f8f8f8;
  z-index: 40;
  transition: background 0.25s ease, height 0.25s ease, box-shadow 0.25s ease, padding 0.25s ease;
}
.main-header.scrolled {
  background: rgba(11, 11, 15, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  flex-shrink: 0;
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
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 0;
  min-width: 220px;
  max-width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.25rem 0;
}
.nav-links::-webkit-scrollbar {
  display: none;
}
.nav-links button {
  border: none;
  background: transparent;
  color: #f0f0f0;
  font-size: 0.9rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
  line-height: 1.2;
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
  flex-shrink: 0;
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
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .main-header {
    padding: 8px 0.85rem;
    grid-template-columns: auto 1fr auto;
  }
  .nav-links {
    gap: 0.4rem;
  }
  .nav-links button {
    font-size: 0.85rem;
    padding: 0.28rem 0.65rem;
  }
  .user-id {
    display: none;
  }
  .ghost span {
    display: none;
  }
}

@media (max-width: 900px) {
  .main-header {
    padding: 8px 0.65rem;
    gap: 0.4rem;
    grid-template-columns: auto 1fr auto;
  }
  .nav-links {
    gap: 0.3rem;
    padding: 0 0.15rem;
  }
  .nav-links button {
    font-size: 0.82rem;
    padding: 0.26rem 0.6rem;
  }
}

@media (max-width: 640px) {
  .main-header {
    padding: 0 0.65rem;
  }
  .logo-text {
    font-size: 0.95rem;
  }
  .actions {
    gap: 0.35rem;
  }
  .ghost span {
    display: none;
  }
  .ghost {
    padding: 0.3rem 0.55rem;
  }
  .user-id {
    display: none;
  }
  .nav-links {
    gap: 0.3rem;
  }
  .nav-links button {
    padding: 0.25rem 0.55rem;
  }
}
</style>
