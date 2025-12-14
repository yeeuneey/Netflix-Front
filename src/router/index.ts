import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Popular from '@/views/Popular.vue';
import Search from '@/views/Search.vue';
import Wishlist from '@/views/Wishlist.vue';
import SignIn from '@/views/Signin.vue';
import { DEFAULT_AUTH, STORAGE_KEYS } from '@/constants/storage';
import { readJSON } from '@/utils/storage';

const routes = [
  { path: '/', component: Home },
  { path: '/popular', component: Popular },
  { path: '/search', component: Search },
  { path: '/wishlist', component: Wishlist },
  { path: '/signin', component: SignIn },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const publicPaths = ['/signin'];

router.beforeEach((to, _from, next) => {
  const auth = readJSON(STORAGE_KEYS.auth, { ...DEFAULT_AUTH });

  if (!publicPaths.includes(to.path) && !auth.isLoggedIn) {
    next('/signin');
    return;
  }

  if (to.path === '/signin' && auth.isLoggedIn) {
    next('/');
    return;
  }

  next();
});
