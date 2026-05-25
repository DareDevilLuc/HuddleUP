import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'


const routes = [
   {
    path: '/',
    component: AuthLayout,        // ← layout wraps the children
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('../pages/LoginPage.vue') },
      { path: 'signup', component: () => import('../pages/SignupPage.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes 
})

export default router
