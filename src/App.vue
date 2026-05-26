<script setup>

import { useAuth } from './composables/useAuth';
const { initAuth } = useAuth();

initAuth()

</script>

<template>
  <RouterView/>
</template>

<style scoped>

</style>
