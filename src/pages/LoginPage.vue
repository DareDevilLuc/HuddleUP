<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
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
  <div class="auth-page">
    <Card class="auth-card">
      <template #title>
        <div class="card-title">Log In</div>
      </template>

      <template #content>
        <form class="form-field" @submit.prevent="handleSignin">
          <FloatLabel class="input-field" variant="in">
            <InputText id="email" v-model="email" type="email" autocomplete="email" />
            <label for="email">Email</label>
          </FloatLabel>

          <FloatLabel class="input-field" variant="in">
            <InputText id="password" v-model="pass" type="password" autocomplete="current-password" />
            <label for="password">Password</label>
          </FloatLabel>

          <Button type="submit" class="submit-button" label="Log In" />

          <p class="error-mess" v-if="error">{{ error }}</p>
          <p class="success-mess" v-if="valid">{{ valid }}</p>

          <p class="helper-text">
            Don't have an account?
            <RouterLink to="/signup" class="link">Sign up</RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>

.error-mess{
  color : red
}

.success-mess{
  color : green
}

.form-field{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem

}

.login-bt{
  width: 25%
}

.login-card {
  width: 25%;
  max-width: 40rem;
  align-items: center;
  justify-content: center;
}

.input-field {
  width: 20rem
}

:deep(.p-inputtext) {
  width: 100%;
}

.card-title {
  color: black
}

.login-card :deep(.p-card-title){
  color: black;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: xx-large;
}

.link {
  color: darkgreen;
  font-size: 0.85rem;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.helper-text {
  color: black
}

</style>