import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Popular from '@/views/Popular.vue';
import Search from '@/views/Search.vue';
import Wishlist from '@/views/Wishlist.vue';
import SignIn from '@/views/Signin.vue';
import { readAuth } from '@/utils/auth';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/popular', component: Popular, meta: { requiresAuth: true } },
  { path: '/search', component: Search, meta: { requiresAuth: true } },
  { path: '/wishlist', component: Wishlist, meta: { requiresAuth: true } },
  { path: '/signin', component: SignIn },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const auth = readAuth();
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);

  if (requiresAuth && !auth.isLoggedIn) {
    next('/signin');
    return;
  }

  if (to.path === '/signin' && auth.isLoggedIn) {
    next('/');
    return;
  }

  next();
});
