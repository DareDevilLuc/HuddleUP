<script setup lang="ts">
import Button from 'primevue/button'
  function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}
</script>

<template>
  <RouterView />
</template>

<style scoped>
.switch-button {
  height: 2rem;
  width: 4rem;
}
</style>
