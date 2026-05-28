<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasks } from '@/composables/useTasks'
import { useRooms } from '@/composables/useRooms'
import { onMounted, watch } from 'vue'
import { Toast } from 'primevue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

const showCreateTask = ref(false)
const newTaskTitle = ref('')
const isSubmitting = ref(false)

const {
  assignedTasks,
  isLoading,
  error,
  loadRoom,
  createTask: createTaskAction,
  deleteTask,
  toggleTask,
  room,
  isAdmin
} = useTasks()

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { leaveRoom } = useRooms()
const roomCode = route.params.roomCode as string

const createTask = async () => {
  if (!newTaskTitle.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Task title is required.', life: 3000 })
    return
  }

  isSubmitting.value = true
  const task = await createTaskAction(newTaskTitle.value.trim())

  if (!task) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Failed to create task.', life: 3000 })
    isSubmitting.value = false
    return
  }

  toast.add({ severity: 'success', summary: 'Done', detail: 'Task created and assigned!', life: 3000 })
  newTaskTitle.value = ''
  showCreateTask.value = false
  isSubmitting.value = false
}

const handleDeleteTask = async (task: any) => {
  const success = await deleteTask(task.task_id)
  if (!success) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Failed to delete task.', life: 3000 })
    return
  }

  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Task deleted.', life: 3000 })
}

const loadRoomData = async (roomCodeID: string) => {
  const roomResult = await loadRoom(roomCodeID)
  if (!roomResult) {
    toast.add({ severity: 'error', summary: 'Not Found', detail: error.value || 'No room found with that code.', life: 3000 })
  }
  return roomResult
}

const handleLeaveRoom = async () => {
  if (!room.value) return
  const success = await leaveRoom(room.value.room_id)
  if (!success) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Failed to leave room.', life: 3000 })
    return
  }
  toast.add({ severity: 'success', summary: 'Left Room', detail: 'You have left the room.', life: 3000 })
  router.push('/main')
}

onMounted(async () => {
  await loadRoomData(roomCode)
})

watch(() => route.params.roomCode as string, async (newRoomCode: string) => {
  await loadRoomData(newRoomCode)
})
</script>

<template>
    <Toast />
    <div class="room">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div style="font-size: xx-large; font-weight: bold;">
                {{ room?.title }}
            </div>
            <Button v-if="!isAdmin" label="Leave Room" icon="pi pi-sign-out" severity="secondary" @click="handleLeaveRoom" />
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
                    <Button v-if="isAdmin" icon="pi pi-trash" severity="danger" text rounded
                        @click.stop="handleDeleteTask(task)" />
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