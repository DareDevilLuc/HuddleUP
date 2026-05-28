<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTasks } from '@/composables/useTasks';
import { onMounted, watch } from 'vue';
import { supabase } from '../../utils/supabase';
import { Toast } from 'primevue';
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

const showCreateTask = ref(false)
const newTaskTitle = ref('')
const isSubmitting = ref(false)

const { fetchAssignedTasks, assignedTasks, isLoading, error } = useTasks()
const toast = useToast()
const route = useRoute()
const { user } = useAuth()
const room_title = ref('')
const room_creator_id = ref('')
const roomCode = route.params.roomCode as string
const room_id = ref('')

const createTask = async () => {
    if (!newTaskTitle.value.trim()) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Task title is required.', life: 3000 })
        return
    }
    isSubmitting.value = true

    // 1. Insert the task
    const { data: taskData, error: taskError } = await supabase
        .from('Task')
        .insert({
            title: newTaskTitle.value.trim(),
            task_creator_id: user.value?.id,
            task_room_id: room_id.value,
            status_task: 'active',
            task_created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (taskError || !taskData) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create task.', life: 3000 })
        isSubmitting.value = false
        return
    }

    // 2. Get all members of the room from Joins
    const { data: members, error: membersError } = await supabase
        .from('Joins')
        .select('user_id')
        .eq('room_id', room_id.value)

    if (membersError || !members) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch room members.', life: 3000 })
        isSubmitting.value = false
        return
    }

    // 3. Insert into Assigned_To for every member
    const assignments = members.map((member: any) => ({
        task_id: taskData.task_id,
        user_id: member.user_id,
        assigned_at: new Date().toISOString()
    }))

    const { error: assignError } = await supabase
        .from('Assigned_To')
        .insert(assignments)

    if (assignError) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign task to members.', life: 3000 })
        isSubmitting.value = false
        return
    }

    toast.add({ severity: 'success', summary: 'Done', detail: 'Task created and assigned!', life: 3000 })
    newTaskTitle.value = ''
    showCreateTask.value = false
    await fetchAssignedTasks(room_id.value)
    isSubmitting.value = false
}

const loadRoom = async (roomCodeID: string) => {
    const { data: room, error: roomError } = await supabase
        .from('Room')
        .select('room_id, title, room_creator_id')
        .eq('room_code', roomCodeID)
        .single()
    if (roomError || !room) {
        toast.add({ severity: 'error', summary: 'Not Found', detail: 'No room found with that code.', life: 3000 })
        return
    }
    fetchAssignedTasks(room.room_id)
    room_title.value = room.title
    room_creator_id.value = room.room_creator_id
    room_id.value = room.room_id
}

onMounted(async () => {
    await loadRoom(roomCode)
})

watch(() => route.params.roomCode as string, async (newRoomCode: string) => {
    await loadRoom(newRoomCode)
})

const isAdmin = computed(() => user.value?.id === room_creator_id.value)

const toggleTask = async (task: any) => {
    const newStatus = task.status_task === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
        .from('Task')
        .update({
            status_task: newStatus,
            completed_at: newStatus === 'inactive' ? new Date().toISOString() : null
        })
        .eq('task_id', task.task_id)
    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update task.', life: 3000 })
        return
    }
    task.status_task = newStatus
    task.completed_at = newStatus === 'inactive' ? new Date().toISOString() : null
}
</script>

<template>
    <Toast />
    <div class="room">
        <div style="font-size: xx-large; font-weight: bold;">
            {{ room_title }}
        </div>
        <div v-if="isAdmin">
            <Button label="Create Task" icon="pi pi-plus" @click="showCreateTask = true" />
        </div>
        <Dialog v-model:visible="showCreateTask" header="Create Task" modal style="width: 400px">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <InputText v-model="newTaskTitle" placeholder="Task title" style="width: 100%" />
                <Button label="Submit" :loading="isSubmitting" @click="createTask" />
            </div>
        </Dialog>

        <div v-if="isLoading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;" />
            <p>Loading your tasks...</p>
        </div>
        <template v-else>
            <div v-if="assignedTasks.length === 0">No tasks yet.</div>
            <div v-else class="task-list">
                <div v-for="task in assignedTasks" :key="task.task_id" class="task-card"
                    :class="{ completed: task.status_task === 'inactive' }" @click="isAdmin && toggleTask(task)"
                    :style="isAdmin ? 'cursor: pointer' : 'cursor: default'">
                    <Checkbox :modelValue="task.status_task === 'inactive'" :binary="true" :disabled="!isAdmin"
                        @click.stop />
                    <span class="task-title">{{ task.title }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.task-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.task-card:hover {
    background: #f5f5f5;
}

.task-card.completed .task-title {
    text-decoration: line-through;
    color: #aaa;
}

.task-title {
    font-size: 1rem;
}
</style>