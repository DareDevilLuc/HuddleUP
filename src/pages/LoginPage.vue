<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const pass = ref('')
const error = ref('')
const valid = ref('')

const handleSignin = async () => {
  error.value = ''
  valid.value = ''

  if (!email.value.trim() || !pass.value.trim()) {
    error.value = 'Please enter both email and password.'
    return
  }

  try {
    await signIn(email.value, pass.value)
    valid.value = 'Logged in successfully! Redirecting...'
    router.replace('/main')
  } catch (e: any) {
    error.value = e.message || 'Unable to sign in. Please check your credentials.'
  }
}
</script>

<template>
  <div class="page-container">
    <div class="bg-shape"></div>

    <div class="brand-header">
      <img src="/HuddleUP Logo.svg" alt="HuddleUp Logo" class="brand-logo" />
      <h1 class="brand-name">HuddleUp</h1>
    </div>

    <div class="content-wrapper">

      <div class="illustration-section">
        <img src="/login.png" alt="Team collaborating" class="illustration" />
      </div>

      <div class="form-section">
        <Card class="glass-card">
          <template #title>
            <h2 class="card-title">Log In</h2>
          </template>

          <template #content>
            <form class="form-layout" @submit.prevent="handleSignin">

              <div class="input-group">
                <label for="email">Email</label>
                <InputText id="email" v-model="email" type="email" autocomplete="email" placeholder="Value" />
              </div>

              <div class="input-group">
                <label for="password">Password</label>
                <InputText id="password" v-model="pass" type="password" autocomplete="current-password" placeholder="Value" />
              </div>

              <div class="action-group">
                <Button type="submit" class="submit-button login-btn" label="Log In" />
              </div>

              <p class="message error-mess" v-if="error">{{ error }}</p>
              <p class="message success-mess" v-if="valid">{{ valid }}</p>

              <p class="helper-text">
                Dont have an account?
                <RouterLink to="/signup" class="link">Sign Up</RouterLink>
              </p>
            </form>
          </template>
        </Card>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Page Layout & Background */
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  font-family: Arial, sans-serif;
}

.bg-shape {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  /* This uses an exact SVG bezier curve that starts at the top,
     swoops smoothly out to the left, and tucks back in at the bottom */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M35,0 C10,40 15,70 30,100 L100,100 L100,0 Z' fill='%233b71ca'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;
}

/* Header */
.brand-header {
  position: absolute;
  top: 2rem;
  left: 3rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10;
}

.brand-logo {
  height: 45px;
  width: auto;
}

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  color: #000;
  margin: 0;
}

/* Content Split */
.content-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  height: 100%;
}

.illustration-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 2rem;
}

.illustration {
  max-width: 80%;
  height: auto;
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Glassmorphism Card */
.glass-card {
  width: 100%;
  max-width: 28rem;
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  padding: 1rem;
  color: white;
}

.card-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
}

/* Form Elements */
.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  color: white;
  margin-left: 0.5rem;
}

:deep(.p-inputtext) {
  width: 100%;
  border-radius: 2rem;
  padding: 0.8rem 1.5rem;
  border: none;
  font-size: 1rem;
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}

/* Buttons */
.action-group {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

:deep(.submit-button.login-btn) {
  background-color: #7ab342;
  border: none;
  border-radius: 2rem;
  padding: 0.75rem 3rem;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
}

:deep(.submit-button.login-btn:hover) {
  background-color: #6a9c39;
  transform: translateY(-2px);
}

/* Messaging and Links */
.message {
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
}

.error-mess { color: #ff9999; }
.success-mess { color: #99ff99; }

.helper-text {
  text-align: center;
  font-size: 0.85rem;
  color: white;
  margin-top: 1rem;
}

.link {
  color: white;
  font-weight: bold;
  text-decoration: underline;
  margin-left: 0.3rem;
}

.link:hover {
  text-decoration: none;
}
</style>
