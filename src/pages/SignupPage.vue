<script setup lang="ts">
    import {ref} from 'vue'
    import Card from 'primevue/card'
    import FloatLabel from 'primevue/floatlabel';
    import InputText from 'primevue/inputtext'
    import Button from 'primevue/button'

    import { useAuth } from '@/composables/useAuth';

    const { signUp } = useAuth()

    const email = ref('')
    const pass = ref('')
    const verify = ref('')
    const error = ref('')

    const handleSignup = async() => {

      try{
         await signUp(email.value, pass.value)

      }
      catch(e : any) {
        error.value = e.message 
      }
    }

</script>


<template>
  <Card class="signup-card">

    <template #title> Sign Up</template>

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

        <FloatLabel class="input-field" variant="in"> 
          <InputText id="verify" v-model="verify" /> 
          <label for="verify">Verify Password</label> 
        </FloatLabel>   

        <Button @click="handleSignup" class="signup-bt" label="Sign Up"/>

        <p class="error-mess" v-if="error"> {{ error }}</p>

        <span style="color: black;">Already have an account? <RouterLink to="/login" class="link">Log in</RouterLink></span>
      </div>


    </template>

  </Card>
</template>

<style scoped>

.error-mess{
  color : red
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



</style>