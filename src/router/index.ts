import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/views/Home.vue';
import Popular from '@/views/Popular.vue';
import Search from '@/views/Search.vue';
import Wishlist from '@/views/Wishlist.vue';
import SignIn from '@/views/Signin.vue';

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
