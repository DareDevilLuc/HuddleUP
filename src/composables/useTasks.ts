import { ref, computed } from 'vue'
import { supabase } from '../../utils/supabase'
import { useAuth } from './useAuth'

export interface TaskData {
  task_id: string
  title: string
  status_task: string
  completed_at: string | null
  task_created_at: string
  task_creator_id: string
  task_room_id: string
  marked_done?: boolean
  done_count?: number
  total_count?: number
}

interface RoomInfo {
  room_id: string
  title: string
  room_creator_id: string
}

export interface MemberData {
  user_id: string
  username: string
  email: string
}

const members = ref<MemberData[]>([])
const room = ref<RoomInfo | null>(null)
const assignedTasks = ref<TaskData[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchMembers = async (room_id: string) => {
  const { data, error: sbError } = await supabase
    .from('Joins')
    .select(
      `
      user_id,
      User ( user_id, username, email )
    `,
    )
    .eq('room_id', room_id)

  if (sbError) {
    error.value = sbError.message
  } else if (data) {
    members.value = data.map((item: any) => item.User)
  }
}

export function useTasks() {
  const { user } = useAuth()

  const isAdmin = computed(() => {
    return Boolean(user.value && room.value?.room_creator_id === user.value.id)
  })

  const fetchAssignedTasks = async (room_id: string) => {
    if (!user.value) return
    isLoading.value = true
    error.value = null

    const { data, error: sbError } = await supabase
      .from('Task')
      .select(
        `
        *,
        Assigned_To (
          user_id,
          marked_done
        )
      `,
      )
      .eq('task_room_id', room_id)

    if (sbError) {
      error.value = sbError.message
    } else if (data) {
      assignedTasks.value = data.map((task: any) => ({
        ...task,
        marked_done:
          task.Assigned_To.find((a: any) => a.user_id === user.value?.id)?.marked_done ?? false,
        done_count: task.Assigned_To.filter((a: any) => a.marked_done).length,
        total_count: task.Assigned_To.length,
      }))
    }

    isLoading.value = false
  }

  const subscribeToTasks = () => {
    if (!room.value) return
    supabase
      .channel(`tasks-${room.value.room_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Assigned_To',
        },
        () => {
          fetchAssignedTasks(room.value!.room_id)
          fetchMembers(room.value!.room_id)
        },
      )
      .subscribe()
  }

  const loadRoom = async (roomCodeID: string) => {
    if (!roomCodeID) return null
    isLoading.value = true
    error.value = null

    const { data: roomData, error: roomError } = await supabase
      .from('Room')
      .select('room_id, title, room_creator_id')
      .eq('room_code', roomCodeID)
      .single()

    if (roomError || !roomData) {
      error.value = roomError?.message || 'No room found with that code.'
      isLoading.value = false
      return null
    }

    room.value = roomData
    await fetchAssignedTasks(roomData.room_id)
    await fetchMembers(roomData.room_id)
    subscribeToTasks()
    isLoading.value = false
    return roomData
  }

  const createTask = async (title: string) => {
    if (!user.value || !room.value || !title.trim()) return null
    isLoading.value = true
    error.value = null

    const { data: taskData, error: taskError } = await supabase
      .from('Task')
      .insert({
        title: title.trim(),
        task_creator_id: user.value.id,
        task_room_id: room.value.room_id,
        status_task: 'active',
        task_created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (taskError || !taskData) {
      error.value = taskError?.message || 'Failed to create task.'
      isLoading.value = false
      return null
    }

    const { data: roomMembers, error: membersError } = await supabase
      .from('Joins')
      .select('user_id')
      .eq('room_id', room.value.room_id)

    if (membersError || !roomMembers) {
      error.value = membersError?.message || 'Failed to fetch room members.'
      isLoading.value = false
      return null
    }

    const assignments = roomMembers.map((member: any) => ({
      task_id: taskData.task_id,
      user_id: member.user_id,
      assigned_at: new Date().toISOString(),
    }))

    const { error: assignError } = await supabase.from('Assigned_To').insert(assignments)

    if (assignError) {
      error.value = assignError.message
      isLoading.value = false
      return null
    }

    await fetchAssignedTasks(room.value.room_id)
    isLoading.value = false
    return taskData
  }

  const deleteTask = async (taskId: string) => {
    if (!taskId) return false
    error.value = null

    const { error: taskError } = await supabase.from('Task').delete().eq('task_id', taskId)

    if (taskError) {
      error.value = taskError.message
      return false
    }

    assignedTasks.value = assignedTasks.value.filter((task) => task.task_id !== taskId)
    return true
  }

  const toggleTask = async (task: TaskData) => {
    if (!task || !user.value) return false
    error.value = null

    const newMarkedDone = !task.marked_done

    const { error: updateError } = await supabase
      .from('Assigned_To')
      .update({ marked_done: newMarkedDone })
      .eq('task_id', task.task_id)
      .eq('user_id', user.value.id)

    if (updateError) {
      error.value = updateError.message
      return false
    }

    task.marked_done = newMarkedDone
    task.done_count = (task.done_count ?? 0) + (newMarkedDone ? 1 : -1)
    return true
  }

  return {
    room,
    isAdmin,
    fetchAssignedTasks,
    fetchMembers,
    loadRoom,
    createTask,
    deleteTask,
    toggleTask,
    subscribeToTasks,
    assignedTasks,
    isLoading,
    error,
    members,
  }
}
