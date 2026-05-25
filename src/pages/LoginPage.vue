<script setup>
  import {ref} from 'vue'
  import Card from 'primevue/card'
  import FloatLabel from 'primevue/floatlabel';
  import InputText from 'primevue/inputtext'

  const value = ref('')
  
</script>

<template>
  <Card class="login-card">
    <template #content>
      <FloatLabel variant="in"> 
        <InputText id="username" v-model="value" /> 
        <label for="username">Username</label> 
      </FloatLabel>   
    </template>
  </Card>
</template>

<style scoped>


.login-card {
  width: 20rem;
  align-items: center;
}

</style>