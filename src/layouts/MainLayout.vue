<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useRooms } from '@/composables/useRooms';

import 'primeicons/primeicons.css';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Menu from 'primevue/menu';
import Button from 'primevue/button'; // Added for a logout button

const router = useRouter();
const { user, signOut } = useAuth();
const { createdRooms, joinedRooms, fetchCreatedRooms, fetchJoinedRooms } = useRooms();

onMounted(async () => {
  await fetchCreatedRooms();
  await fetchJoinedRooms();
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
  flex-direction: row;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.nav-menu {
  width: 300px;
  border-radius: 0;
  height: 100vh;
  border-right: 1px solid var(--surface-border);
}

.content-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 2rem;
}
</style>