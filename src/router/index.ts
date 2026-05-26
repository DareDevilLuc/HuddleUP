import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { supabase } from '../../utils/supabase.ts'



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

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data.session

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login' }
  }
})

export default router
