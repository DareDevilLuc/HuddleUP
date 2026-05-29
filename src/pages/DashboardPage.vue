<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRooms } from '@/composables/useRooms'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms, createRoom, joinRoom, isLoading, error } = useRooms()

// --- Create Room Dialog ---
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

// --- Join Room Dialog ---
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

watch(() => route.query.action, (action) => {
  if (action === 'join') showJoinDialog.value = true
  if (action === 'create') showCreateDialog.value = true
  
  // Clear the query so it can trigger again next click
  if (action) router.replace({ query: {} })
}, { immediate: true })

onMounted(async () => {
  await fetchCreatedRooms()
  await fetchJoinedRooms()

  // Auto-open dialog if redirected from sidebar buttons
  if (route.query.action === 'join') showJoinDialog.value = true
  if (route.query.action === 'create') showCreateDialog.value = true
})
</script>

<template>
  <Toast />
<!--  -->
  <div class="dashboard">
    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem;" />
      <p>Loading your rooms...</p>
    </div>

    <template v-else>
      <!-- Joined Rooms -->
      <section class="room-section">
        <h2 class="section-label">
          <i class="pi pi-users" />
          Rooms I Joined
        </h2>
        <div v-if="joinedRooms.length" class="room-grid">
          <div
            v-for="room in joinedRooms"
            :key="room.room_id"
            class="room-card"
            @click="goToRoom(room.room_code)"
          >
            <div class="card-top">
              <span class="room-code">{{ room.room_code }}</span>
              <span class="room-badge member">member</span>
            </div>
            <h3 class="room-title">{{ room.title }}</h3>
            <p class="room-date">Created {{ formatDate(room.room_created_at) }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="pi pi-inbox" />
          <p>You haven't joined any rooms yet. Use a room code to join one.</p>
        </div>
      </section>

      <!-- Created Rooms -->
      <section class="room-section">
        <h2 class="section-label">
          <i class="pi pi-folder-open" />
          Rooms I Created
        </h2>
        <div v-if="createdRooms.length" class="room-grid">
          <div
            v-for="room in createdRooms"
            :key="room.room_id"
            class="room-card owner"
            @click="goToRoom(room.room_code)"
          >
            <div class="card-top">
              <span class="room-code">{{ room.room_code }}</span>
              <span class="room-badge owner-badge">owner</span>
            </div>
            <h3 class="room-title">{{ room.title }}</h3>
            <p class="room-date">Created {{ formatDate(room.room_created_at) }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="pi pi-plus-circle" />
          <p>No rooms created yet. Start one for your group!</p>
        </div>
      </section>
    </template>

    <!-- Create Room Dialog -->
    <Dialog v-model:visible="showCreateDialog" header="Create a New Room" :style="{ width: '400px' }" modal>
      <div class="dialog-body">
        <label class="dialog-label">Room Name</label>
        <InputText
          v-model="newRoomTitle"
          placeholder="e.g. Sprint Planning, Study Group..."
          class="w-full"
          @keyup.enter="handleCreateRoom"
          autofocus
        />
        <p class="dialog-hint">A unique room code will be generated automatically.</p>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Create Room" icon="pi pi-plus" :loading="isLoading" :disabled="!newRoomTitle.trim()" @click="handleCreateRoom" />
      </template>
    </Dialog>

    <!-- Join Room Dialog -->
    <Dialog v-model:visible="showJoinDialog" header="Join a Room" :style="{ width: '400px' }" modal>
      <div class="dialog-body">
        <label class="dialog-label">Room Code</label>
        <InputText
          v-model="joinCode"
          placeholder="e.g. AB12CD"
          class="w-full"
          style="text-transform: uppercase;"
          @keyup.enter="handleJoinRoom"
          autofocus
        />
        <p class="dialog-hint">Ask your team for the 6-character room code.</p>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showJoinDialog = false" />
        <Button label="Join Room" icon="pi pi-sign-in" :loading="isJoining" :disabled="!joinCode.trim()" @click="handleJoinRoom" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  border: 1px dashed rgba(15, 23, 42, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-secondary);
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  color: var(--accent);
}

.room-section {
  margin-bottom: 2.5rem;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.room-card {
  background: var(--surface-panel);
  border: 1px solid var(--surface-border);
  border-radius: 20px;
  padding: 1.4rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.room-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
  border-color: rgba(15, 118, 110, 0.3);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.room-code {
  font-family: monospace;
  font-size: 0.8rem;
  background: rgba(15, 118, 110, 0.06);
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: var(--accent);
  letter-spacing: 0.08em;
}

.room-badge,
.owner-badge {
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.room-badge.member {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

.owner-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.room-title {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-primary);
}

.room-date {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-label {
  font-weight: 700;
  color: var(--text-primary);
}

.dialog-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.w-full {
  width: 100%;
}

.room-badge.member {
  background: var(--blue-100);
  color: var(--blue-700);
}

.room-badge.owner-badge {
  background: var(--green-100);
  color: var(--green-700);
}

.room-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.room-date {
  font-size: 0.78rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.card-footer {
  margin-top: auto;
  padding-top: 0.75rem;
}

.enter-hint {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem;
  border: 1px dashed var(--surface-border);
  border-radius: 12px;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  opacity: 0.4;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-color-secondary);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.dialog-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color);
}

.dialog-hint {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.w-full {
  width: 100%;
}
</style>