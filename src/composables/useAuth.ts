import { ref } from 'vue'
import { supabase } from '../../utils/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
  // Sign up
  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {data: {username}}})
    if (error) throw error

    return data
  }

  // Sign in
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  // Listen to auth state changes
  const initAuth = () => {
    supabase.auth.getSession().then(({ data }) => {
      user.value = data.session?.user ?? null
    })

    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user ?? null
    })
  }

  return { user, signUp, signIn, signOut, initAuth }
}