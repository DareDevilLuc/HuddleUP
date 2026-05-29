<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { signUp } = useAuth()

const email = ref('')
const username = ref('')
const pass = ref('')
const verify = ref('')
const error = ref('')
const success = ref('')

const handleSignup = async () => {
  error.value = ''
  success.value = ''

  if (!email.value.trim() || !pass.value.trim() || !verify.value.trim() || !username.value.trim()) {
    error.value = 'Please complete all fields.'
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
  <div class="auth-page">
    <Card class="auth-card">
      <template #title>
        <div class="card-title">Sign Up</div>
      </template>

      <template #content>
        <form class="form-field" @submit.prevent="handleSignup">
          <FloatLabel class="input-field" variant="in">
            <InputText id="email" v-model="email" type="email" autocomplete="email" />
            <label for="email">Email</label>
          </FloatLabel>

          <FloatLabel class="input-field" variant="in">
            <InputText id="username" v-model="username" type="username" autocomplete="username" />
            <label for="username">Username</label>
          </FloatLabel>

          <FloatLabel class="input-field" variant="in">
            <InputText id="password" v-model="pass" type="password" autocomplete="new-password" />
            <label for="password">Password</label>
          </FloatLabel>

          <FloatLabel class="input-field" variant="in">
            <InputText id="verify" v-model="verify" type="password" autocomplete="new-password" />
            <label for="verify">Verify Password</label>
          </FloatLabel>

          <Button type="submit" class="submit-button" label="Sign Up" />

          <p class="error-mess" v-if="error">{{ error }}</p>
          <p class="success-mess" v-if="success">{{ success }}</p>

          <p class="helper-text">
            Already have an account?
            <RouterLink to="/login" class="link">Log in</RouterLink>
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

.signed-mess{
  color : green
}

.form-field{
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 2rem

}

.signup-bt{
  width: 25%
}

.signup-card {
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

.signup-card :deep(.p-card-title){
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