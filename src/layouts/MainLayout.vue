<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useRooms } from '@/composables/useRooms';

import 'primeicons/primeicons.css';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const router = useRouter();
const { user, signOut, updateUsername } = useAuth();
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms, subscribeToRooms } = useRooms();

const settingsMenu = ref();
const showEditProfile = ref(false);
const newUsername = ref('');
const isUpdatingProfile = ref(false);

const toggleSettingsMenu = (event: Event) => {
  settingsMenu.value?.toggle(event);
};

const settingsMenuItems = [
  {
    label: 'Edit Profile',
    icon: 'pi pi-user-edit',
    command: () => {
      newUsername.value = username.value;
      showEditProfile.value = true;
    }
  },
  { separator: true },
  {
    label: 'Log Out',
    icon: 'pi pi-sign-out',
    command: () => handleSignOut()
  }
];

onMounted(async () => {
  subscribeToRooms();
  await fetchCreatedRooms();
  await fetchJoinedRooms();
});

const handleSignOut = async () => {
  await signOut();
  router.push('/login');
};

const handleSaveProfile = async () => {
  if (!newUsername.value.trim()) return;
  isUpdatingProfile.value = true;
  await updateUsername(newUsername.value.trim());
  showEditProfile.value = false;
  isUpdatingProfile.value = false;
};

const username = computed(() => {
  return user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || 'User'
})
</script>

<template>
  <div class="main-layout">
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
      <div class="top-bar">
        <div class="spacer" />
        <Button
          icon="pi pi-cog"
          rounded
          text
          severity="secondary"
          class="settings-btn"
          @click="$event => settingsMenu?.toggle($event)"
          aria-haspopup="true"
          aria-controls="settings-menu"
        />
        <Menu
          id="settings-menu"
          ref="settingsMenu"
          :model="settingsMenuItems"
          :popup="true"
          class="settings-menu"
        />
      </div>
      <RouterView />
    </div>

    <Dialog v-model:visible="showEditProfile" header="Edit Profile" modal :style="{ width: '400px' }">
      <div class="dialog-content">
        <label class="dialog-label">Username</label>
        <InputText v-model="newUsername" class="w-full" @keyup.enter="handleSaveProfile" autofocus />
        <div class="dialog-actions mt-3 flex justify-end">
          <Button label="Cancel" text severity="secondary" @click="showEditProfile = false" />
          <Button label="Save" :loading="isUpdatingProfile" @click="handleSaveProfile" />
        </div>
      </div>
    </Dialog>
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
  /* Using width/height instead of font-size to keep the exact same size as the old icon */
  width: 1.4rem;
  height: 1.4rem;
  object-fit: contain; /* Ensures your photo doesn't stretch or squish */
}
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

/* User Card */
.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255,255,255,0.18);
  border-radius: 14px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
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
  color: rgba(255,255,255,0.75);
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
  color: rgba(255,255,255,0.65);
  margin: 0.5rem 0.75rem 0.4rem;
}

.nav-empty {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
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
  color: rgba(255,255,255,0.85);
  font-size: 0.88rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.nav-item.active {
  background: rgba(255,255,255,0.22);
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
  background: #4279CC !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
}

.btn-create:hover {
  background: #3569bc !important;
}

.btn-join {
  background: #7E9E34 !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

.btn-join:hover {
  background: #6e8e24 !important;
}


/* ── Top Bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.5rem;
}

.spacer {
  flex: 1;
}

.settings-btn {
  color: #151e30 !important;
  transition: all 0.2s ease;
}

.dialog-label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.dialog-actions {
  gap: 0.5rem;
}

.w-full { width: 100%; }
.mt-3 { margin-top: 1rem; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }

/* ── Content Container Update ── */
/* ── Content ── */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow-y: auto;
}

</style>
