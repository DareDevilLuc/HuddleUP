<script setup lang="ts">
  import {ref} from 'vue'
  import Card from 'primevue/card'
  import FloatLabel from 'primevue/floatlabel';
  import InputText from 'primevue/inputtext'
  import Button from 'primevue/button'
  import { useAuth } from '@/composables/useAuth';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const { signIn } = useAuth()

  const email = ref('')
  const pass = ref('')

  const error = ref('')
  const valid = ref('')

  const handleSignin = async() => {
      try {
        await signIn(email.value, pass.value)
        router.replace('/main')
      }
      catch(e : any) {
        error.value = e.message
      }
  }
  
</script>

<template>
  <Card class="login-card">

    <template #title> Log In</template>

    <template #content>


      <div class="form-field">
        <FloatLabel class="input-field" variant="in"> 
          <InputText id="email" v-model="email"/> 
          <label for="email">Email</label> 
        </FloatLabel>   

        <FloatLabel class="input-field" variant="in"> 
          <InputText id="password" v-model="pass" /> 
          <label for="password">Password</label> 
        </FloatLabel>   

        <Button @click="handleSignin" class="login-bt" label="Log In"/>

        <p class="error-mess" v-if="error"> {{ error }}</p>
        <p class="success-mess" v-if="valid"> {{ valid}}</p>

        <span style="color: black;">Don't have an account? <RouterLink to="/signup" class="link">Sign up</RouterLink></span>
        
      </div>


    </template>

  </Card>
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

</style>