<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useRooms } from '@/composables/useRooms';

import 'primeicons/primeicons.css';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Menu from 'primevue/menu';
import Button from 'primevue/button'; // Added for a logout button

const router = useRouter();
const route = useRoute();
const { user, signOut } = useAuth();
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms } = useRooms();

const refreshRooms = async () => {
  await fetchCreatedRooms();
  await fetchJoinedRooms();
};

onMounted(async () => {
  await refreshRooms();
});

// Watch for route changes to refresh room data when returning from room operations
watch(() => route.path, async (newPath) => {
  // Refresh rooms when navigating to dashboard or main layout areas
  if (newPath.includes('/main/dashboard') || newPath === '/main') {
    await refreshRooms();
  }
});

// Use computed so the menu reacts automatically when room data arrives from Supabase
const items = computed(() => [
  {
    label: 'NAVIGATION',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => router.push('/main/dashboard')
      },
    ]
  },
  {
    label: 'JOINED ROOMS',
    items: joinedRooms.value.length
      ? joinedRooms.value.map(room => ({
        label: room.title,
        icon: 'pi pi-users',
        //Navigate to the room when clicked
        command: () => router.push(`/main/rooms/${room.room_code}`)
      }))
      : [{ label: 'No joined rooms yet', disabled: true }]
  },
  {
    label: 'CREATED ROOMS',
    items: createdRooms.value.length
      ? createdRooms.value.map(room => ({
        label: room.title,
        icon: 'pi pi-folder',
        //Navigate to the room when clicked
        command: () => router.push(`/main/rooms/${room.room_code}`)
      }))
      : [{ label: 'No created rooms yet', disabled: true }]
  },
]);

const handleSignOut = async () => {
  await signOut();
  router.push('/login');
};
</script>

<template>
  <div class="main-layout">
    <div class="sidebar">
      <Menu class="nav-menu" :model="items">
        <template #start>
          <div style="display: flex; flex-direction: row;">
            <div style="padding: 1rem;">
              <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
            </div>
            <div style="display: flex; flex-direction: column; padding: 1rem; justify-content: center;">
              <span style="font-weight: bold; font-size: medium; overflow-wrap: anywhere;">
                {{ user?.email || 'Loading...' }}
              </span>
            </div>
          </div>
          <div style="padding: 0 1rem 1rem 1rem;">
            <Button label="Log Out" icon="pi pi-sign-out" severity="secondary" size="small" outlined
              @click="handleSignOut" style="width: 100%" />
          </div>
          <Divider />
        </template>
      </Menu>

      <!-- Bottom actions -->
      <div class="sidebar-bottom">
        <Button label="Join Room" icon="pi pi-sign-in" severity="secondary" outlined style="width: 100%"
          @click="$router.push('/main/dashboard?action=join')" />
        <Button label="Create Room" icon="pi pi-plus" style="width: 100%"
          @click="$router.push('/main/dashboard?action=create')" />
      </div>
    </div>

    <div class="content-container">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.88);
}

.sidebar {
  width: 360px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.2rem;
  box-shadow: 4px 0 40px rgba(15, 23, 42, 0.06);
}

.nav-menu {
  flex: 1;
  border-radius: 24px;
  background: transparent;
  border: none;
  overflow: hidden;
}

.nav-menu :deep(.p-submenu-header) {
  padding: 1rem 1.15rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.nav-menu :deep(.p-menuitem-link) {
  border-radius: 14px;
  margin: 0.35rem 0;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: auto;
}

.sidebar-bottom :deep(.p-button) {
  width: 100%;
}

.content-container {
  flex: 1;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>