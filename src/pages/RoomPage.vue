<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTasks } from '@/composables/useTasks';
import { onMounted, watch } from 'vue';
import { supabase } from '../../utils/supabase';
import { Toast } from 'primevue';
import { useToast } from 'primevue/usetoast'

const { fetchAssignedTasks, assignedTasks, isLoading, error } = useTasks()

const toast = useToast()
const route = useRoute()


const room_title = ref('')
const roomCode = route.params.roomCode as string

const loadRoom = async (roomCodeID : string) => {

    const { data : room, error : roomError } = await supabase
    .from('Room')
    .select('room_id, title, room_creator_id')
    .eq('room_code', roomCodeID)
    .single()

    if( roomError || !room ) {
        toast.add({ severity: 'error', summary: 'Not Found', detail: 'No room found with that code.', life: 3000 })
        return
    }

    fetchAssignedTasks(room.room_id)

    room_title.value = room.title


}

onMounted(async () => {

    await loadRoom(roomCode)

})

watch(() => route.params.roomCode as string, async (newRoomCode : string) => {
    await loadRoom(newRoomCode)
})

</script>


<template>

    <Toast/>



    <div class="room">

        <div style="font-size: xx-large; font-weight: bold;">

            {{ room_title }}

        </div>

        <div v-if="isLoading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem;" />
        <p>Loading your tasks...</p>
        </div>

    </div>



</template>


<style scoped>

</style>