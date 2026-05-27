<script setup>


import { supabase } from '../utils/supabase'

import { useAuth } from './composables/useAuth';
const { initAuth } = useAuth();

initAuth()

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    router.push('/login')
  }
})

</script>

<template>
  <RouterView/>
</template>

<style scoped>

</style>
