<script setup lang="ts">

import { ref } from 'vue';

import 'primeicons/primeicons.css'



import Avatar from 'primevue/avatar'
import Divider from 'primevue/divider';
import Menu from 'primevue/menu'

const items = ref([
  {
    label: 'NAVIGATION',
    items: [
      { label: 'Dashboard'},
    ]
  },
  {
    label: 'MY ROOMS (JOINED)',
    items: [
    ]
  },
  {
    label: 'MY ROOMS (CREATED)',
    items: [
    ]
  },
]);


</script>


<template>

    <div class="main-layout">

        <Menu class="nav-menu" :model="items">
            <template #start>

                <div style="display: flex; flex-direction: row;">

                    <div style="padding: 1rem;">
                        <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
                    </div>

                    <div style="display: flex; flex-direction: column; padding: 1rem;">

                        <span style="font-weight: bold; font-size: x-large;">Name Nimo</span>
                        <span style="font-size: small;">whateveremailhere@whatthefuck.com</span>


                    </div>

                </div>

                <Divider/>
            </template>

        </Menu>



    </div>



</template>


<style scoped>

.main-layout {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
}


.content-container {
    display: flex;
    flex-direction: column;
}




</style>