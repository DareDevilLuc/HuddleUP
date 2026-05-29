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
  isAdmin,
  members,
} = useTasks()

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { leaveRoom } = useRooms()
const roomCode = route.params.roomCode as string

const createTask = async () => {
  if (!newTaskTitle.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Task title is required.',
      life: 3000,
    })
    return
  }

  isSubmitting.value = true
  const task = await createTaskAction(newTaskTitle.value.trim())

  if (!task) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value || 'Failed to create task.',
      life: 3000,
    })
    isSubmitting.value = false
    return
  }

  toast.add({
    severity: 'success',
    summary: 'Done',
    detail: 'Task created and assigned!',
    life: 3000,
  })
  newTaskTitle.value = ''
  showCreateTask.value = false
  isSubmitting.value = false
}

const handleDeleteTask = async (task: any) => {
  const success = await deleteTask(task.task_id)
  if (!success) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value || 'Failed to delete task.',
      life: 3000,
    })
    return
  }

  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Task deleted.', life: 3000 })
}

const loadRoomData = async (roomCodeID: string) => {
  const roomResult = await loadRoom(roomCodeID)
  if (!roomResult) {
    toast.add({
      severity: 'error',
      summary: 'Not Found',
      detail: error.value || 'No room found with that code.',
      life: 3000,
    })
  }
  return roomResult
}

const handleLeaveRoom = async () => {
  if (!room.value) return
  const success = await leaveRoom(room.value.room_id)
  if (!success) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value || 'Failed to leave room.',
      life: 3000,
    })
    return
  }
  toast.add({
    severity: 'success',
    summary: 'Left Room',
    detail: 'You have left the room.',
    life: 3000,
  })
  router.push('/main')
}

onMounted(async () => {
  await loadRoomData(roomCode)
})

watch(
  () => route.params.roomCode as string,
  async (newRoomCode: string) => {
    await loadRoomData(newRoomCode)
  },
)
</script>

<template>
  <Toast />

  <div class="room-page">
    <div class="room-header">
      <div>
        <h1 class="room-page-title">{{ room?.title || 'Room' }}</h1>
      </div>
      <div class="room-header-actions">
        <Button
          v-if="isAdmin"
          label="Create Task"
          icon="pi pi-plus"
          class="action-button"
          @click="showCreateTask = true"
        />
        <Button
          v-else
          label="Leave Room"
          icon="pi pi-sign-out"
          severity="secondary"
          class="action-button"
          @click="handleLeaveRoom"
        />
      </div>
    </div>

    <div class="room-meta">
      <span class="room-pill">{{ isAdmin ? 'Owner' : 'Member' }}</span>
      <span class="room-label"
        >Code: <strong>{{ route.params.roomCode }}</strong></span
      >
      <div class="members-section">
        <span class="room-label">
          <i class="pi pi-users" /> {{ members.length }}
          {{ members.length === 1 ? 'Member' : 'Members' }}
        </span>
        <div class="members-list">
          <span v-for="member in members" :key="member.user_id" class="member-pill">
            {{ member.username }}
          </span>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showCreateTask" header="Create Task" modal class="task-dialog">
      <div class="dialog-body">
        <InputText v-model="newTaskTitle" placeholder="Task title" class="dialog-input" />
        <Button label="Submit" :loading="isSubmitting" class="dialog-submit" @click="createTask" />
      </div>
    </Dialog>

    <div v-if="isLoading" class="loading-state">
      <i class="pi pi-spin pi-spinner" />
      <p>Loading your tasks...</p>
    </div>

    <template v-else>
      <div v-if="assignedTasks.length === 0" class="empty-tasks">
        <i class="pi pi-inbox" />
        <p>No tasks yet. Create one to keep your room moving.</p>
      </div>

      <div v-else class="task-list">
        <div
          v-for="task in assignedTasks"
          :key="task.task_id"
          class="task-card"
          :class="{ completed: task.marked_done }"
          @click="toggleTask(task)"
        >
          <Checkbox :modelValue="task.marked_done" :binary="true" @click.stop />
          <span class="task-title">{{ task.title }}</span>
          <span class="done-counter">{{ task.done_count }}/{{ task.total_count }}</span>
          <Button
            v-if="isAdmin"
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            class="delete-button"
            @click.stop="handleDeleteTask(task)"
          />
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

.members-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.member-pill {
  background: #f0f0f0;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #444;
}

.done-counter {
  margin-left: auto;
  font-size: 0.85rem;
  color: #888;
  font-weight: 600;
}
</style>
