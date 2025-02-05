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
      meta: { hideNavbar: false, hideFooter: false }, // 显示导航栏和页脚
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: PricingPage,
      meta: { hideNavbar: false, hideFooter: false }, // 显示导航栏和页脚
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/pages/notfound/NotFound.vue'),
      meta: { hideNavbar: false, hideFooter: false }, // 显示导航栏和页脚
    },
    {
      path: '/login',
      component: () => import('@/pages/auth/AuthLayout.vue'),
      meta: {
        hideNavbar: true,
        hideFooter: true,
        layout: 'auth',
      },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/components/LogInIndex.vue'),
          meta: {
            hideNavbar: true,
            hideFooter: true,
          },
        },
        {
          path: 'email-login',
          name: 'email-login',
          component: () => import('@/components/LogInEmail.vue'),
          meta: {
            hideNavbar: true,
            hideFooter: true,
          },
        },
        {
          path: 'forgot',
          name: 'forgot',
          component: () => import('@/components/ForgotPassword.vue'),
          meta: {
            hideNavbar: true,
            hideFooter: true,
          },
        },
      ],
    },
    {
      path: '/register',
      component: () => import('@/pages/auth/AuthLayout.vue'),
      meta: {
        hideNavbar: true,
        hideFooter: true,
        layout: 'auth',
      },
      children: [
        {
          path: '',
          name: 'register',
          component: () => import('@/components/Register.vue'),
          meta: {
            hideNavbar: true,
            hideFooter: true,
          },
        },
      ],
    },
    // 其他路由...
  ],
})

export default router
