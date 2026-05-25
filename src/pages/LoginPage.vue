<script setup>
  import {ref} from 'vue'
  import Card from 'primevue/card'
  import FloatLabel from 'primevue/floatlabel';
  import InputText from 'primevue/inputtext'

  const value = ref('')
  
</script>

<template>
  <Card class="login-card">

    <template #title> Log In</template>

    <template #content>


      <div class="form-field">
        <FloatLabel variant="in"> 
          <InputText id="username" v-model="value" /> 
          <label for="username">Username</label> 
        </FloatLabel>   

        <FloatLabel variant="in"> 
          <InputText id="password" v-model="value" /> 
          <label for="password">Password</label> 
        </FloatLabel>   
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


.login-card {
  width: 35%;
  max-width: 40rem;
  align-items: center;
  justify-content: center;
}

</style>