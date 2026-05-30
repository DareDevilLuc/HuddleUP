<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRooms } from '@/composables/useRooms'

import EditProfile from '@/pages/EditProfile.vue'

import 'primeicons/primeicons.css'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'

const router = useRouter()
const { user, signOut } = useAuth()
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms, subscribeToRooms } = useRooms()

const showEditProfile = ref(false)
const showSettingsMenu = ref(false)
const settingsMenuRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  subscribeToRooms()
  await fetchCreatedRooms()
  await fetchJoinedRooms()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e: MouseEvent) => {
  if (settingsMenuRef.value && !settingsMenuRef.value.contains(e.target as Node)) {
    showSettingsMenu.value = false
  }
}

const handleSignOut = async () => {
  await signOut()
  router.push('/login')
}

const openEditProfile = () => {
  showSettingsMenu.value = false
  showEditProfile.value = true
}

const username = computed(() => {
  return user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || 'User'
})
</script>

<template>
  <div class="main-layout">
    <EditProfile v-model:visible="showEditProfile" />

    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="/your-photo.png" alt="HuddleUp Logo" class="logo-icon" />
        <span class="logo-text">HuddleUp</span>
      </div>

      <div class="user-card-container">
        <div class="user-card">
          <Avatar icon="pi pi-user" size="large" shape="circle" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="user-email">{{ user?.email || 'Loading...' }}</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <p class="nav-section-label">NAVIGATION</p>
        <div
          class="nav-item"
          :class="{ active: $route.path === '/main/dashboard' }"
          @click="router.push('/main/dashboard')"
        >
          <i class="pi pi-home" />
          <span>Dashboard</span>
        </div>
      </nav>

      <nav class="sidebar-nav">
        <p class="nav-section-label">JOINED ROOMS</p>
        <p v-if="!joinedRooms.length" class="nav-empty">Join a room and start huddling!</p>
        <div
          v-for="room in joinedRooms"
          :key="room.room_id"
          class="nav-item"
          :class="{ active: $route.params.roomCode === room.room_code }"
          @click="router.push(`/main/rooms/${room.room_code}`)"
        >
          <i class="pi pi-users" />
          <span>{{ room.title }}</span>
        </div>
      </nav>

      <nav class="sidebar-nav">
        <p class="nav-section-label">CREATED ROOMS</p>
        <p v-if="!createdRooms.length" class="nav-empty">Create a room and start the huddle!</p>
        <div
          v-for="room in createdRooms"
          :key="room.room_id"
          class="nav-item"
          :class="{ active: $route.params.roomCode === room.room_code }"
          @click="router.push(`/main/rooms/${room.room_code}`)"
        >
          <i class="pi pi-folder" />
          <span>{{ room.title }}</span>
        </div>
      </nav>

      <div class="sidebar-spacer" />

      <div class="sidebar-bottom">
        <Button
          label="Create Room"
          class="btn-create"
          @click="router.push('/main/dashboard?action=create')"
        />
        <Button
          label="Join Room"
          class="btn-join"
          @click="router.push('/main/dashboard?action=join')"
        />
      </div>
    </aside>

    <div class="content-container">
      <!-- Top bar with settings -->
      <div class="topbar">
        <div class="topbar-right" ref="settingsMenuRef">
          <button class="settings-btn" @click.stop="showSettingsMenu = !showSettingsMenu">
            <i class="pi pi-cog" />
          </button>

          <transition name="menu-fade">
            <div v-if="showSettingsMenu" class="settings-menu">
              <button class="menu-item" @click="openEditProfile">
                <i class="pi pi-user-edit" />
                <span>Edit Profile</span>
              </button>
              <div class="menu-divider" />
              <button class="menu-item danger" @click="handleSignOut">
                <i class="pi pi-sign-out" />
                <span>Log Out</span>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
.sidebar {
  width: 300px;
  min-height: 100vh;
  background: #3a72d4;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  gap: 0.25rem;
  flex-shrink: 0;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem 1.25rem;
}

.logo-icon {
  width: 1.4rem;
  height: 1.4rem;
  object-fit: contain;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

/* User Card */
.user-card-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  background: #6b9fe8 !important;
  color: #fff !important;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Nav sections */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.5rem;
}

.nav-section-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.65);
  margin: 0.5rem 0.75rem 0.4rem;
}

.nav-empty {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0.75rem 0.25rem;
  font-style: italic;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.88rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-weight: 600;
}

.nav-item i {
  font-size: 0.9rem;
  opacity: 0.85;
}

/* Spacer */
.sidebar-spacer {
  flex: 1;
}

/* Bottom Buttons */
.sidebar-bottom {
  display: flex;
  flex-direction: row;
  gap: 0.6rem;
  padding: 0.75rem 0 0.25rem;
}

.btn-create,
.btn-join {
  flex: 1;
  border-radius: 999px !important;
  font-weight: 600 !important;
  font-size: 0.82rem !important;
  padding: 0.55rem 0.5rem !important;
}

.btn-create {
  background: #4279cc !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
}

.btn-create:hover {
  background: #3569bc !important;
}

.btn-join {
  background: #7e9e34 !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

.btn-join:hover {
  background: #6e8e24 !important;
}

/* ── Content ── */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow-y: auto;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.topbar-right {
  position: relative;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s ease;
}

.settings-btn:hover {
  background: #f3f4f6;
  color: #3a72d4;
  border-color: #d1d5db;
}

/* Dropdown menu */
.settings-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 170px;
  padding: 0.4rem;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  text-align: left;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #3a72d4;
}

.menu-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.menu-item i {
  font-size: 0.9rem;
  opacity: 0.8;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.3rem 0;
}

/* Menu animation */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
