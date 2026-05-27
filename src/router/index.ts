import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { supabase } from '../../utils/supabase.ts'
import MainLayout from '@/layouts/MainLayout.vue'



const routes = [
  {
    path: '/',
    component: AuthLayout,        // ← layout wraps the children
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('../pages/LoginPage.vue') },
      { path: 'signup', component: () => import('../pages/SignupPage.vue') },
    ]
  },
  {
    path: '/main',
    component: MainLayout,
    meta: { requiresAuth: true }, 
    children: [
      { path: '', redirect: '/main/dashboard' },
      { path: 'dashboard', component: () => import('../pages/DashboardPage.vue'), meta: { requiresAuth: true }},
    ]
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/main') // redirect logged-in users away from login
  } else {
    next()
  }
})


export default router
