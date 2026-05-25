<script setup lang="ts">
import Button from 'primevue/button'
  function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}
</script>

<template>

  <Button class="switch-button" label="Switch" @click="toggleDarkMode()" />

  <div class="auth-container">
    <RouterView />
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.switch-button {
  height: 2rem;
  width: 4rem;
}
</style>