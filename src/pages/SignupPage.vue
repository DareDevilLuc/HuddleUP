<script setup lang="ts">
    import {ref} from 'vue'
    import Card from 'primevue/card'
    import FloatLabel from 'primevue/floatlabel';
    import InputText from 'primevue/inputtext'
    import Button from 'primevue/button'

    const value = ref('')

</script>


<template>
  <Card class="signup-card">

    <template #title> Sign Up</template>

    <template #content>


      <div class="form-field">
        <FloatLabel class="input-field" variant="in"> 
          <InputText id="username" v-model="value"/> 
          <label for="username">Username</label> 
        </FloatLabel>   

        <FloatLabel class="input-field" variant="in"> 
          <InputText id="password" v-model="value" /> 
          <label for="password">Password</label> 
        </FloatLabel>   

        <FloatLabel class="input-field" variant="in"> 
          <InputText id="verify" v-model="value" /> 
          <label for="verify">Verify Password</label> 
        </FloatLabel>   

        <Button class="signup-bt" label="Sign Up"/>

        <span style="color: black;">Already have an account? <RouterLink to="/login" class="link">Log in</RouterLink></span>
      </div>


    </template>

  </Card>
</template>

<style scoped>

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