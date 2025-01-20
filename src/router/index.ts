import { createRouter, createWebHistory } from 'vue-router'
import HomeIndex from '@/pages/index/HomeIndex.vue'
import PricingPage from '@/pages/pricing/PricngPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeIndex,
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: PricingPage,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/pages/notfound/NotFound.vue'),
    },
    // 其他路由...
  ],
})

export default router
