<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '../../utils/supabase'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', val: boolean): void }>()

const { user } = useAuth()

const username = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const successMsg = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    username.value = user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || ''
    error.value = null
    successMsg.value = ''
  }
})

const handleSave = async () => {
  error.value = null
  successMsg.value = ''
  loading.value = true

  try {
    const { error: authErr } = await supabase.auth.updateUser({
      data: { username: username.value }
    })
    if (authErr) throw authErr

    const { error: dbErr } = await supabase
      .from('User')
      .update({ username: username.value })
      .eq('user_id', user.value?.id)
    if (dbErr) throw dbErr

    successMsg.value = 'Username updated!'
    setTimeout(() => emit('update:visible', false), 1000)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    modal
    header="Edit Profile"
    :style="{ width: '380px', borderRadius: '18px' }"
    :draggable="false"
  >
    <div class="modal-body">
      <div class="field">
        <label class="field-label">Username</label>
        <InputText v-model="username" class="field-input" placeholder="Enter a username" />
      </div>

      <div class="field">
        <label class="field-label">
          Email <span class="readonly-tag">read-only</span>
        </label>
        <InputText :value="user?.email || ''" class="field-input" disabled />
      </div>

      <p v-if="error" class="msg error">{{ error }}</p>
      <p v-if="successMsg" class="msg success">{{ successMsg }}</p>
    </div>

    <template #footer>
      <Button label="Cancel" text @click="emit('update:visible', false)" />
      <Button label="Save" :loading="loading" class="btn-save" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0.5rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.readonly-tag {
  font-size: 0.7rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}

.field-input {
  width: 100%;
  border-radius: 10px !important;
}

.msg {
  font-size: 0.83rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }

.btn-save {
  background: #3a72d4 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 999px !important;
  font-weight: 600 !important;
}
.btn-save:hover {
  background: #2f62c0 !important;
}
</style>
