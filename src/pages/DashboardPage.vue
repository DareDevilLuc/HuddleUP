<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRooms } from '@/composables/useRooms'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '../../utils/supabase'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms, createRoom, joinRoom, isLoading, error } = useRooms()

const { user } = useAuth()

// ── Dashboard-local task state ────────────────────────
interface DashboardTask {
  task_id: string
  title: string
  task_room_id: string
  marked_done: boolean
}

const dashboardTasks = ref<DashboardTask[]>([])

const fetchAllMyTasks = async () => {
  if (!user.value) return

  const { data, error: sbError } = await supabase
    .from('Assigned_To')
    .select(`
      marked_done,
      Task (
        task_id,
        title,
        task_room_id
      )
    `)
    .eq('user_id', user.value.id)

  if (sbError || !data) return

  dashboardTasks.value = data
    .filter((row: any) => row.Task)
    .map((row: any) => ({
      task_id: row.Task.task_id,
      title: row.Task.title,
      task_room_id: row.Task.task_room_id,
      marked_done: row.marked_done,
    }))
}

// ── Stats ─────────────────────────────────────────────
const username = computed(() => {
  if (!user.value) return 'User'
  return user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || 'User'
})

const totalPeopleHuddled = computed(() => {
  const uniqueTeammates = new Set()
  allRooms.value.forEach(room => {
    if (room.members && Array.isArray(room.members)) {
      room.members.forEach((member: any) => uniqueTeammates.add(member.user_id))
    }
  })
  const count = uniqueTeammates.size > 0 ? uniqueTeammates.size - 1 : 0
  return count > 0 ? count : 0
})

const totalTasks = computed(() => dashboardTasks.value.length)
const completedTasks = computed(() => dashboardTasks.value.filter(t => t.marked_done).length)
const completionPercent = computed(() =>
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)
const totalActiveRooms = computed(() => joinedRooms.value.length + createdRooms.value.length)

// ── Room carousel ─────────────────────────────────────
const allRooms = computed(() => [...joinedRooms.value, ...createdRooms.value])
const roomProgressIndex = ref(0)
const currentRoom = computed(() => allRooms.value[roomProgressIndex.value] ?? null)
const prevRoom = () => { if (roomProgressIndex.value > 0) roomProgressIndex.value-- }
const nextRoom = () => { if (roomProgressIndex.value < allRooms.value.length - 1) roomProgressIndex.value++ }

// ── Task group carousel ───────────────────────────────
const tasksByRoom = computed(() => {
  const groups: Record<string, {
    room_id: string
    room_code: string
    room_title: string
    tasks: DashboardTask[]
    doneCount: number
  }> = {}

  dashboardTasks.value.forEach(task => {
    const room = allRooms.value.find(r => r.room_id === task.task_room_id)
    if (!room) return

    if (!groups[task.task_room_id]) {
      groups[task.task_room_id] = {
        room_id: room.room_id,
        room_code: room.room_code,
        room_title: room.title,
        tasks: [],
        doneCount: 0,
      }
    }
    groups[task.task_room_id]!.tasks.push(task)
    if (task.marked_done) groups[task.task_room_id]!.doneCount++
  })

  return Object.values(groups)
})

const taskGroupIndex = ref(0)
const currentTaskGroup = computed(() => tasksByRoom.value[taskGroupIndex.value] ?? null)
const prevTaskGroup = () => { if (taskGroupIndex.value > 0) taskGroupIndex.value-- }
const nextTaskGroup = () => { if (taskGroupIndex.value < tasksByRoom.value.length - 1) taskGroupIndex.value++ }

// ── Dialogs ───────────────────────────────────────────
const showCreateDialog = ref(false)
const newRoomTitle = ref('')

const handleCreateRoom = async () => {
  if (!newRoomTitle.value.trim()) return
  const room = await createRoom(newRoomTitle.value.trim())
  if (room) {
    toast.add({ severity: 'success', summary: 'Room Created', detail: `"${room.title}" is ready!`, life: 3000 })
    showCreateDialog.value = false
    newRoomTitle.value = ''
    await fetchJoinedRooms()
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Could not create room.', life: 3000 })
  }
}

const showJoinDialog = ref(false)
const joinCode = ref('')
const isJoining = ref(false)

const handleJoinRoom = async () => {
  if (!joinCode.value.trim()) return
  isJoining.value = true

  const result = await joinRoom(joinCode.value.trim().toUpperCase())

  if (!result) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.value || 'Could not join the room.', life: 3000 })
    isJoining.value = false
    return
  }

  if (result.alreadyJoined) {
    toast.add({ severity: 'info', summary: 'Already Joined', detail: `You are already in "${result.room.title}".`, life: 3000 })
    router.push(`/main/rooms/${joinCode.value.trim().toUpperCase()}`)
    isJoining.value = false
    return
  }

  toast.add({ severity: 'success', summary: 'Joined!', detail: `Welcome to "${result.room.title}"`, life: 3000 })
  await fetchJoinedRooms()
  showJoinDialog.value = false
  const code = joinCode.value.trim().toUpperCase()
  joinCode.value = ''
  router.push(`/main/rooms/${code}`)
  isJoining.value = false
}

const goToRoom = (roomCode: string) => {
  router.push(`/main/rooms/${roomCode}`)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Lifecycle ─────────────────────────────────────────
watch(() => route.query.action, (action) => {
  if (action === 'join') showJoinDialog.value = true
  if (action === 'create') showCreateDialog.value = true
  if (action) router.replace({ query: {} })
}, { immediate: true })

onMounted(async () => {
  await fetchCreatedRooms()
  await fetchJoinedRooms()
  await fetchAllMyTasks()

  if (route.query.action === 'join') showJoinDialog.value = true
  if (route.query.action === 'create') showCreateDialog.value = true
})
</script>

<template>
  <Toast />

  <div class="dashboard-page">

    <div class="dashboard-header">
      <div class="header-titles">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Welcome back! Here's a quick overview of you and your team's progress.</p>
      </div>

      <div class="header-illustration">
        <img src="/placeholder-team.gif" alt="Team illustration" class="header-img" />
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card stat-card--welcome">
        <div class="stat-card__illus">
          <img src="/placeholder-huddle.png" alt="Huddle illustration" class="stat-illus-img" />
        </div>
        <div class="stat-card__text">
          <div class="stat-card__label">Huddle Up,</div>
          <div class="stat-card__label">{{ username }}!</div>
        </div>
      </div>

      <div class="stat-card stat-card--tasks">
        <div class="stat-card__value">{{ completedTasks }}/{{ totalTasks }}</div>
        <div class="stat-card__sub">
          <div>{{ totalTasks }} Total Tasks across all rooms</div>
          <div>{{ completedTasks }} Completed ({{ completionPercent }}%)</div>
        </div>
      </div>

      <div class="stat-card stat-card--rooms">
        <div class="stat-card__value stat-card__value--large">{{ totalActiveRooms }}</div>
        <div class="stat-card__sub">
          <div><strong>Total Active Rooms</strong></div>
          <div>{{ joinedRooms.length }} Joined / {{ createdRooms.length }} Created</div>
        </div>
      </div>

      <div class="stat-card stat-card--people">
        <div class="stat-card__value stat-card__value--large">{{ totalPeopleHuddled }}</div>
        <div class="stat-card__sub">
          <div><strong>People Huddled</strong></div>
          <div>Teammates across your rooms</div>
        </div>
      </div>
    </div>

    <!-- ── Room Progress ─────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-title">Room Progress</span>
        <div class="carousel-nav">
          <button class="nav-btn" @click="prevRoom" :disabled="roomProgressIndex === 0 || allRooms.length === 0">
            <i class="pi pi-chevron-left" />
          </button>
          <button class="nav-btn" @click="nextRoom"
            :disabled="roomProgressIndex >= allRooms.length - 1 || allRooms.length === 0">
            <i class="pi pi-chevron-right" />
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="empty-hint">
        <i class="pi pi-spin pi-spinner" /> Loading rooms...
      </div>
      <div v-else-if="allRooms.length === 0" class="empty-hint">
        Join or create a room and huddle up with your team.
      </div>
      <div v-else-if="currentRoom" class="room-progress-card" @click="goToRoom(currentRoom.room_code)">
        <div class="rp-top">
          <span class="rp-code">{{ currentRoom.room_code }}</span>
          <span class="rp-badge"
            :class="createdRooms.find(r => r.room_code === currentRoom?.room_code) ? 'owner' : 'member'">
            {{ createdRooms.find(r => r.room_code === currentRoom?.room_code) ? 'owner' : 'member' }}
          </span>
        </div>
        <div class="rp-title">{{ currentRoom.title }}</div>
        <div class="rp-date">Created {{ formatDate(currentRoom.room_created_at) }}</div>
      </div>
    </div>

    <!-- ── Assigned Tasks ────────────────────────────── -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-title">Your Assigned Tasks</span>
        <div class="section-header-right">
          <span v-if="totalTasks > 0" class="tasks-summary-pill">
            {{ completedTasks }}/{{ totalTasks }} completed
          </span>
          <div class="carousel-nav" v-if="tasksByRoom.length > 1">
            <button class="nav-btn" @click="prevTaskGroup" :disabled="taskGroupIndex === 0">
              <i class="pi pi-chevron-left" />
            </button>
            <button class="nav-btn" @click="nextTaskGroup" :disabled="taskGroupIndex >= tasksByRoom.length - 1">
              <i class="pi pi-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="dashboardTasks.length === 0" class="empty-hint">
        You don't have any assigned tasks yet.
      </div>

      <div v-else-if="currentTaskGroup" class="tasks-panel">
        <!-- Group header -->
        <div class="room-task-label">
          <span class="rp-code">{{ currentTaskGroup.room_code }}</span>
          <span class="room-task-name">{{ currentTaskGroup.room_title }}</span>
          <span class="room-task-count">{{ currentTaskGroup.doneCount }}/{{ currentTaskGroup.tasks.length }} done</span>
        </div>

        <!-- Task list -->
        <div class="task-list">
          <div
            v-for="task in currentTaskGroup.tasks"
            :key="task.task_id"
            class="task-item"
            :class="{ 'task-item--done': task.marked_done }"
          >
            <div class="task-check" :class="{ 'task-check--done': task.marked_done }">
              <i v-if="task.marked_done" class="pi pi-check" style="font-size: 0.6rem;" />
            </div>
            <span class="task-item__title">{{ task.title }}</span>
            <span
              class="task-item__status"
              :class="task.marked_done ? 'done' : 'pending'"
            >
              {{ task.marked_done ? 'Done' : 'Pending' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Dialogs ────────────────────────────────────── -->
    <Dialog v-model:visible="showCreateDialog" header="Create a New Room" :style="{ width: '400px' }" modal>
      <div class="dialog-body">
        <label class="dialog-label">Room Name</label>
        <InputText v-model="newRoomTitle" placeholder="e.g. Sprint Planning, Study Group..." class="w-full"
          @keyup.enter="handleCreateRoom" autofocus />
        <p class="dialog-hint">A unique room code will be generated automatically.</p>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Create Room" icon="pi pi-plus" :loading="isLoading" :disabled="!newRoomTitle.trim()"
          @click="handleCreateRoom" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showJoinDialog" header="Join a Room" :style="{ width: '400px' }" modal>
      <div class="dialog-body">
        <label class="dialog-label">Room Code</label>
        <InputText v-model="joinCode" placeholder="e.g. AB12CD" class="w-full" style="text-transform: uppercase;"
          @keyup.enter="handleJoinRoom" autofocus />
        <p class="dialog-hint">Ask your team for the 6-character room code.</p>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showJoinDialog = false" />
        <Button label="Join Room" icon="pi pi-sign-in" :loading="isJoining" :disabled="!joinCode.trim()"
          @click="handleJoinRoom" />
      </template>
    </Dialog>

  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 3rem 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.75rem;
  background: #f5f7f2;
  min-height: 100%;
  font-family: 'Segoe UI', sans-serif;
}

/* ── Header ──────────────────────────────────────────── */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dashboard-title {
  font-size: 4rem;
  font-weight: 800;
  color: #8CAE3A;
  margin: 0;
  line-height: 1;
}

.header-illustration {
  width: 220px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 27px;
  right: 20px;
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ── Stat Cards ──────────────────────────────────────── */
.stats-row {
  display: flex;
  gap: 0.75rem;
  margin-top: -2rem;
}

.stat-card {
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
  min-width: 0;
}

.stat-card--welcome {
  background: #8CAE3A;
  color: white;
  flex: 1.1;
}

.stat-card--tasks {
  background: #8CAE3A;
  color: white;
  flex: 1.2;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.stat-card--rooms {
  background: #8CAE3A;
  color: white;
  flex: 0.9;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.stat-card--people {
  background: #8CAE3A;
  color: white;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.stat-card__illus {
  width: 80px;
  height: 72px;
  flex-shrink: 0;
  position: relative;
}

.stat-illus-img {
  position: absolute;
  width: 120px;
  height: 170px;
  object-fit: contain;
  bottom: -31px;
  left: -20px;
  max-width: none;
  z-index: 10;
}

.stat-card__text {
  display: flex;
  flex-direction: column;
}

.stat-card__label {
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1.15;
  color: white;
}

.stat-card__value {
  font-size: 2.3rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-card__value--large {
  font-size: 2.3rem;
}

.stat-card__sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.5;
}

/* ── Section Shared ──────────────────────────────────── */
.section-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d2d2d;
}

.empty-hint {
  font-size: 0.88rem;
  color: #9aaa88;
  padding: 0.25rem 0;
}

/* ── Room Progress Carousel ──────────────────────────── */
.carousel-nav {
  display: flex;
  gap: 0.4rem;
}

.nav-btn {
  background: none;
  border: 1px solid #ccd9b8;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5a8a2e;
  font-size: 0.75rem;
  transition: background 0.15s, border-color 0.15s;
}

.nav-btn:hover:not(:disabled) {
  background: #e8f5d6;
  border-color: #7ec035;
}

.nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.room-progress-card {
  background: white;
  border: 1px solid #dde8cc;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-progress-card:hover {
  border-color: #8CAE3A;
  box-shadow: 0 4px 12px rgba(140, 174, 58, 0.15);
  transform: translateY(-2px);
}

.rp-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.rp-code {
  font-family: monospace;
  font-size: 0.78rem;
  background: #eef7e4;
  color: #5a8a2e;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  letter-spacing: 0.08em;
}

.rp-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  letter-spacing: 0.07em;
}

.rp-badge.member {
  background: #dbeafe;
  color: #1d4ed8;
}

.rp-badge.owner {
  background: #d1fae5;
  color: #065f46;
}

.rp-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d2d2d;
}

.rp-date {
  font-size: 0.78rem;
  color: #8a9a78;
}

/* ── Assigned Tasks ──────────────────────────────────── */
.tasks-summary-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5a8a2e;
  background: #eef7e4;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.tasks-panel {
  background: white;
  border: 1px solid #e2ebd4;
  border-radius: 14px;
  padding: 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.room-task-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.room-task-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0;
}

.room-task-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #2d2d2d;
}

.room-task-count {
  font-size: 0.75rem;
  color: #9aaa88;
  margin-left: auto;
  background: #f0f5e8;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-weight: 500;
}

.room-task-divider {
  border: none;
  border-top: 1px dashed #e2ebd4;
  margin: 0.75rem 0 0.25rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tasks-panel .task-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #ffffff;
  border: 1px solid #dde8cc;
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  /* Reset any inherited list/global styles */
  margin: 0;
  list-style: none;
  text-decoration: none;
}

.tasks-panel .task-item:hover {
  border-color: #a8cc6a;
  box-shadow: 0 4px 14px rgba(140, 174, 58, 0.14);
  transform: translateY(-1px);
}

.tasks-panel .task-item.task-item--done {
  background: #f7faf2;
  border-color: #ddecc8;
  box-shadow: none;
}

.task-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ccd9b8;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: white;
  transition: background 0.2s, border-color 0.2s;
}

.task-check--done {
  background: #8CAE3A;
  border-color: #8CAE3A;
}

.task-item__title {
  flex: 1;
  font-size: 0.85rem;
  color: #2d2d2d;
  font-weight: 500;
  line-height: 1.4;
}

.task-item--done .task-item__title {
  text-decoration: line-through;
  color: #b0be9e;
}

.task-item__status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

.task-item__status.done {
  background: #dcfce7;
  color: #166534;
}

.task-item__status.pending {
  background: #f3f4f6;
  color: #6b7280;
}

/* ── Dialogs ─────────────────────────────────────────── */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.5rem 0;
}

.dialog-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d2d2d;
}

.dialog-hint {
  font-size: 0.8rem;
  color: #9aaa88;
  margin: 0;
}

.w-full {
  width: 100%;
}
</style>