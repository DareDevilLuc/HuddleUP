<script setup lang="ts">
import Button from 'primevue/button'
  function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-header">
      <div>
        <h1>HuddleUP</h1>
        <p>Sign in or sign up to stay connected with your group.</p>
      </div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>

.auth-header {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

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