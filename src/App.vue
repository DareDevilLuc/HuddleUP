<script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from './utils/supabase'
  import Button from 'primevue/button'
  
  const todos = ref([])

  async function getTodos() {
    const { data } = await supabase.from('todos').select()
    todos.value = data
  }

  onMounted(() => {
    getTodos()
  })

</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
  </ul>

  <Button>test</Button>
</template>