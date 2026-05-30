<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasks } from '@/composables/useTasks'
import { useRooms } from '@/composables/useRooms'
import { useToast } from 'primevue/usetoast'

import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'

const showCreateTask = ref(false)
const newTaskTitle = ref('')
const isSubmitting = ref(false)

const showEditTask = ref(false)
const editingTaskId = ref<string | null>(null)
const editingTaskTitle = ref('')

const {
  assignedTasks,
  isLoading,
  error,
  loadRoom,
  createTask: createTaskAction,
  deleteTask,
  toggleTask,
  updateTask,
  room,
  isAdmin,
  members,
  subscribeToTasks,
  unsubscribeFromTasks
} = useTasks()

const toast = useToast()
const router = useRouter()
const route = useRoute()
const { leaveRoom, deleteRoom } = useRooms()
const roomCode = route.params.roomCode as string

// ─── Overall Room Progress ──────────────────────────────────────────────────
// Total possible = tasks × members (every member must complete every task)
// Total done     = sum of all marked_done=true records across all tasks
const overallProgress = computed(() => {
  const taskCount = assignedTasks.value.length
  const memberCount = members.value.length
  if (taskCount === 0 || memberCount === 0) return 0

  const totalPossible = taskCount * memberCount
  const totalDone = assignedTasks.value.reduce(
    (sum, task) => sum + (task.assignments?.filter(a => a.marked_done).length ?? 0),
    0
  )

  return Math.round((totalDone / totalPossible) * 100)
})

// ─── Per-Member Progress ────────────────────────────────────────────────────
// For a given member: how many tasks have they personally marked done?
// Each task's `assignments` array holds the per-user marked_done records.
function getMemberProgress(userId: string): number {
  const taskCount = assignedTasks.value.length
  if (taskCount === 0) return 0

  const memberDone = assignedTasks.value.filter(
    task => task.assignments?.find(a => a.user_id === userId)?.marked_done === true
  ).length

  return Math.round((memberDone / taskCount) * 100)
}

// ─── Task Actions ───────────────────────────────────────────────────────────
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
    toast.add({ severity: 'error', summary: 'Not Found', detail: error.value || 'No room found.', life: 3000 })
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

const handleDeleteRoom = async () => {
  if (!room.value) return
  const confirmed = window.confirm('Delete this room and all tasks permanently? This cannot be undone.')
  if (!confirmed) return

  const success = await deleteRoom(room.value.room_id)
  if (!success) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Failed to delete room.', life: 3000 })
    return
  }
  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Room and all tasks were removed.', life: 3000 })
  router.push('/main')
}

const editingTask = ref<any>(null)
const editTaskTitle = ref('')

const openEditTask = (task: any) => {
  editingTaskId.value = task.task_id
  editingTaskTitle.value = task.title
  showEditTask.value = true
}

const handleEditTask = async () => {
  if (!editingTaskId.value || !editingTaskTitle.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Task title is required.', life: 3000 })
    return
  }

  isSubmitting.value = true
  try {
    const success = await updateTask(editingTaskId.value, editingTaskTitle.value.trim())

    if (!success) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Failed to update task.', life: 3000 })
      isSubmitting.value = false
      return
    }

    toast.add({ severity: 'success', summary: 'Done', detail: 'Task updated!', life: 3000 })
    showEditTask.value = false
    editingTaskId.value = null
    editingTaskTitle.value = ''
  } catch (err) {
    console.error('Update error:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while updating.', life: 3000 })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadRoomData(roomCode)
  subscribeToTasks()
})

onUnmounted(() => {
  unsubscribeFromTasks()
})

watch(
  () => route.params.roomCode as string,
  async (newRoomCode: string) => {
    await loadRoomData(newRoomCode)
  }
)
</script>

<template>
  <Toast />

  <div class="room-page">

    <div class="room-header-card">
      <div class="header-top-row">
        <h1 class="room-title">{{ room?.title || 'Loading Room...' }}</h1>

        <div class="header-actions">
          <Button v-if="isAdmin" icon="pi pi-trash" severity="danger" text rounded @click="handleDeleteRoom" title="Delete Room" />
          <Button v-else icon="pi pi-sign-out" severity="secondary" text rounded @click="handleLeaveRoom" title="Leave Room" />

          <div class="code-badge">{{ route.params.roomCode }}</div>
        </div>
      </div>

      <div class="room-progress-section">
        <span class="progress-text">{{ overallProgress }}%</span>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="room-content-grid">

      <div class="tasks-column">
        <div class="column-header">
          <h2 class="section-title">Tasks ({{ assignedTasks.length }})</h2>
          <Button
            v-if="isAdmin"
            label="Add New Task"
            icon="pi pi-plus-circle"
            class="btn-add-task"
            @click="showCreateTask = true"
          />
        </div>

        <div v-if="isLoading" class="loading-state">
          <i class="pi pi-spin pi-spinner" /> Loading tasks...
        </div>

        <div v-else-if="assignedTasks.length === 0" class="empty-state">
          No tasks yet. Create one to get started!
        </div>

        <div v-else class="task-list">
          <div
            v-for="task in assignedTasks"
            :key="task.task_id"
            class="task-card"
            :class="{ 'is-done': task.marked_done }"
            @click="toggleTask(task)"
          >
            <div class="task-card-left">
              <Checkbox :modelValue="task.marked_done" :binary="true" variant="filled" class="task-checkbox" @click.stop="toggleTask(task)" />
              <div class="task-info">
                <span class="task-title">{{ task.title }}</span>
                <span class="task-desc">Task assigned to you and others. Please complete this before the deadline.</span>
              </div>
            </div>

            <div class="task-card-right">
              <div class="avatar-group">
                <Avatar v-for="member in members.slice(0, 3)" :key="member.user_id" icon="pi pi-user" shape="circle" class="overlap-avatar" />
              </div>
              <Button v-if="isAdmin" icon="pi pi-pencil" severity="secondary" text rounded @click.stop="openEditTask(task)" title="Edit Task" />
              <Button v-if="isAdmin" icon="pi pi-trash" severity="danger" text rounded @click.stop="handleDeleteTask(task)" />
            </div>
          </div>
        </div>
      </div>

      <div class="members-column">
        <div class="column-header">
          <h2 class="section-title">Members ({{ members.length }})</h2>
        </div>
        <hr class="section-divider" />

        <div class="members-list">
          <div v-for="member in members" :key="member.user_id" class="member-item">
            <Avatar icon="pi pi-user" size="large" shape="circle" class="member-avatar" />

            <div class="member-info">
              <span class="member-name">
                {{ member.username }}
                <span v-if="member.user_id === room?.room_creator_id" class="owner-badge">(Owner)</span>
              </span>
              <div class="member-progress-track">
                <!-- ✅ Each member's own independent progress -->
                <div
                  class="member-progress-fill"
                  :style="{ width: getMemberProgress(member.user_id) + '%' }"
                />
              </div>
            </div>
            
            <!-- ✅ Each member's own percentage -->
            <span class="member-percent">{{ getMemberProgress(member.user_id) }}%</span>
          </div>
        </div>
      </div>

    </div>

    <Dialog v-model:visible="showCreateTask" header="Create New Task" modal :style="{ width: '400px' }">
      <div class="dialog-content">
        <InputText v-model="newTaskTitle" placeholder="What needs to be done?" class="w-full" @keyup.enter="createTask" autofocus />
        <div class="dialog-actions mt-3 flex justify-end">
          <Button label="Cancel" text severity="secondary" @click="showCreateTask = false" />
          <Button label="Add Task" :loading="isSubmitting" @click="createTask" />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="showEditTask" header="Edit Task" modal :style="{ width: '400px' }">
      <div class="dialog-content">
        <InputText v-model="editingTaskTitle" placeholder="Update task..." class="w-full" @keyup.enter="handleEditTask" autofocus />
        <div class="dialog-actions mt-3 flex justify-end">
          <Button label="Cancel" text severity="secondary" @click="showEditTask = false" />
          <Button label="Save Changes" :loading="isSubmitting" @click="handleEditTask" />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
/* ── Layout & Page ── */
.room-page {
  padding: 2rem 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Top Header Card ── */
.room-header-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.75rem 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #7E9E34;
  margin: 0;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.code-badge {
  background: #4279CC;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  letter-spacing: 0.05em;
}

.room-progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
}

.progress-track {
  width: 100%;
  height: 14px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4279CC;
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* ── Content Grid ── */
.room-content-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 3rem;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.section-divider {
  border: none;
  border-bottom: 2px solid #eaeaea;
  margin-bottom: 1.5rem;
}

/* ── Tasks Section ── */
.btn-add-task {
  background: #7E9E34 !important;
  border: none !important;
  border-radius: 999px !important;
  font-weight: 600 !important;
  padding: 0.5rem 1.25rem !important;
}

.btn-add-task:hover {
  background: #6e8e24 !important;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgb(255, 255, 255);
  border: 1.5px solid #eaeaea;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.task-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.task-card-left {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  flex: 1;
}

.task-checkbox {
  margin-top: 0.2rem;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.task-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #444;
  transition: color 0.2s;
}

.task-desc {
  font-size: 0.85rem;
  color: #a0a0a0;
  line-height: 1.4;
  max-width: 90%;
}

.task-card.is-done .task-title {
  text-decoration: line-through;
  color: #b0b0b0;
}

.task-card-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.overlap-avatar {
  border: 2px solid #ffffff;
  margin-left: -10px;
  background: #e0e0e0;
  color: #666;
}
.overlap-avatar:first-child {
  margin-left: 0;
}

/* ── Members Section ── */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  background: #f0f0f0;
  color: #666;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.member-name {
  font-size: 1rem;
  font-weight: 700;
  color: #222;
}

.owner-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7E9E34;
  margin-left: 0.25rem;
}

.member-progress-track {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.member-progress-fill {
  height: 100%;
  background: #4279CC;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.member-percent {
  font-size: 0.85rem;
  font-weight: 700;
  color: #555;
  min-width: 40px;
  text-align: right;
}

.w-full { width: 100%; }
.mt-3 { margin-top: 1rem; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
</style>
