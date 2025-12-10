import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/pages/Home.vue';
import Popular from '@/pages/Popular.vue';
import Search from '@/pages/Search.vue';
import Wishlist from '@/pages/Wishlist.vue';
import SignIn from '@/pages/Signin.vue';

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
