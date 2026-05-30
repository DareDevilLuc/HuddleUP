<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const router = useRouter()
const { signUp } = useAuth()

const email = ref('')
const username = ref('')
const pass = ref('')
const verify = ref('')
const error = ref('')
const success = ref('')

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())

const handleSignup = async () => {
  error.value = ''
  success.value = ''

  if (!email.value.trim() || !pass.value.trim() || !verify.value.trim() || !username.value.trim()) {
    error.value = 'Please complete all fields.'
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  if (pass.value !== verify.value) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    await signUp(email.value, pass.value, username.value)
    success.value = 'Signup successful! Redirecting to login...'
    router.replace('/login')
  } catch (e: any) {
    error.value = e.message || 'Unable to sign up. Please try again.'
  }
}
</script>

<template>
  <div class="page-container">
    <div class="brand-header">
      <img src="/HuddleUP Logo.svg" alt="HuddleUp Logo" class="brand-logo" />
      <h1 class="brand-name">HuddleUP</h1>
    </div>

    <div class="content-wrapper">
      <div class="illustration-section">
        <img src="/signup.png" alt="Creative team idea" class="illustration" />
      </div>

      <div class="form-section">
        <Card class="glass-card">
          <template #title>
            <h2 class="card-title">Sign Up</h2>
          </template>

          <template #content>
            <form class="form-layout" @submit.prevent="handleSignup">
              <div class="input-group">
                <label for="email">Email</label>
                <InputText id="email" v-model="email" type="email" autocomplete="email" placeholder="user@gmail.com" />
              </div>

              <div class="input-group">
                <label for="password">Password</label>
                <InputText id="password" v-model="pass" type="password" autocomplete="new-password" placeholder="password" />
              </div>

              <div class="input-group">
                <label for="verify">Verify Password</label>
                <InputText id="verify" v-model="verify" type="password" autocomplete="new-password" placeholder="password" />
              </div>

              <div class="input-group">
                <label for="username">Username</label>
                <InputText id="username" v-model="username" type="text" autocomplete="username" placeholder="username" />
              </div>

              <div class="action-group">
                <Button type="submit" class="submit-button signup-btn" label="Create Account" />
              </div>

              <p class="message error-mess" v-if="error">{{ error }}</p>
              <p class="message success-mess" v-if="success">{{ success }}</p>

              <p class="helper-text">
                Already have an account?
                <RouterLink to="/login" class="link">Log In</RouterLink>
              </p>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');

/* Page Layout & Background */
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-image: url('/background.png');
  background-size: auto 110vh;
  background-position: 115% top;
  background-repeat: no-repeat;
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
  height: 100px;
  width: auto;
}

.brand-name {
  font-family: 'Inter', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: #191919;
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
  flex: 1.2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 8rem;
}

.illustration {
  max-width: 100%;
  height: auto;
}

.form-section {
  flex: 0.9;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Glassmorphism Card */
.glass-card {
  width: 100%;
  max-width: 28rem;
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 5rem !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
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
  gap: 1.15rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.input-group label {
  font-size: 0.9rem;
  color: white;
  margin-left: 0.5rem;
}

:deep(.p-inputtext) {
  width: 100%;
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
