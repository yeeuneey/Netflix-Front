import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import PopularPage from '../pages/PopularPage.vue'
import SearchPage from '../pages/SearchPage.vue'
import WishlistPage from '../pages/WishlistPage.vue'
import SigninPage from '../pages/SigninPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/popular', name: 'popular', component: PopularPage },
    { path: '/search', name: 'search', component: SearchPage },
    { path: '/wishlist', name: 'wishlist', component: WishlistPage },
    { path: '/signin', name: 'signin', component: SigninPage },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router