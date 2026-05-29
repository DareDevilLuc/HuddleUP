import { ref } from 'vue'
import { supabase } from '../../utils/supabase'
import { useAuth } from './useAuth'

export interface RoomData {
  room_id: string
  room_code: string
  title: string
  status_room: string
  room_creator_id: string
  closed_at: string | null
  room_created_at: string
}
const { user } = useAuth()
const createdRooms = ref<RoomData[]>([])
const joinedRooms = ref<RoomData[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useRooms() {
  type JoinRoomData = Pick<RoomData, 'room_id' | 'title' | 'status_room' | 'room_code'>

  interface JoinRoomResult {
    room: JoinRoomData
    alreadyJoined: boolean
  }

  // Fetch rooms the user created
  const fetchCreatedRooms = async () => {
    if (!user.value) return
    isLoading.value = true
    error.value = null

    const { data, error: sbError } = await supabase
      .from('Room')
      .select('*')
      .eq('room_creator_id', user.value.id)
      .eq('status_room', 'active')

    if (sbError) error.value = sbError.message
    else createdRooms.value = data || []

    isLoading.value = false
  }

  // Fetch rooms the user joined via the Joins table
  const fetchJoinedRooms = async () => {
    if (!user.value) return
    isLoading.value = true
    error.value = null

    const { data, error: sbError } = await supabase
      .from('Joins')
      .select(
        `
        room_id,
        Room ( * )
      `,
      )
      .eq('user_id', user.value.id)

    if (sbError) {
      error.value = sbError.message
    } else if (data) {
      joinedRooms.value = data
        .map((item: any) => item.Room)
        .filter(
          (room: RoomData) =>
            room.status_room === 'active' && room.room_creator_id !== user.value?.id,
        )
    }

    isLoading.value = false
  }

  // Create new room
  const createRoom = async (title: string) => {
    if (!user.value) return null
    isLoading.value = true
    error.value = null

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: roomData, error: roomError } = await supabase
      .from('Room')
      .insert([
        {
          title: title,
          room_code: roomCode,
          room_creator_id: user.value.id,
          status_room: 'active',
        },
      ])
      .select()
      .single()

    if (roomError) {
      error.value = roomError.message
      isLoading.value = false
      return null
    }

    const { error: joinError } = await supabase.from('Joins').insert([
      {
        room_id: roomData.room_id,
        user_id: user.value.id,
        role: 'admin',
      },
    ])

    if (joinError) {
      error.value = joinError.message
    } else {
      await fetchCreatedRooms()
    }

    isLoading.value = false
    return roomData
  }

  const joinRoom = async (roomCode: string): Promise<JoinRoomResult | null> => {
    if (!user.value) return null
    isLoading.value = true
    error.value = null

    const code = roomCode.trim().toUpperCase()
    const { data: room, error: roomError } = await supabase
      .from('Room')
      .select('room_id, title, status_room, room_code')
      .eq('room_code', code)
      .maybeSingle()

    if (roomError || !room) {
      error.value = roomError?.message || 'No room found with that code.'
      isLoading.value = false
      return null
    }

    if (room.status_room !== 'active') {
      error.value = 'This room is no longer active.'
      isLoading.value = false
      return null
    }

    const { data: existing, error: existingError } = await supabase
      .from('Joins')
      .select('room_id')
      .eq('room_id', room.room_id)
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (existingError) {
      error.value = existingError.message
      isLoading.value = false
      return null
    }

    if (existing) {
      isLoading.value = false
      return { room, alreadyJoined: true }
    }

    const { error: joinError } = await supabase
      .from('Joins')
      .insert([{ room_id: room.room_id, user_id: user.value.id, role: 'member' }])

    if (joinError) {
      error.value = joinError.message
      isLoading.value = false
      return null
    }

    const { data: existingTasks } = await supabase
      .from('Task')
      .select('task_id')
      .eq('task_room_id', room.room_id)

    if (existingTasks && existingTasks.length > 0) {
      const assignments = existingTasks.map((task: any) => ({
        task_id: task.task_id,
        user_id: user.value!.id,
        marked_done: false,
        assigned_at: new Date().toISOString(),
      }))

      await supabase.from('Assigned_To').insert(assignments)
    }

    await fetchJoinedRooms()
    isLoading.value = false
    return { room, alreadyJoined: false }
  }

  const leaveRoom = async (roomId: string): Promise<boolean> => {
    if (!user.value) return false
    error.value = null

    const { data: roomTasks } = await supabase
      .from('Task')
      .select('task_id')
      .eq('task_room_id', roomId)

    if (roomTasks && roomTasks.length > 0) {
      const taskIds = roomTasks.map((task: any) => task.task_id)

      await supabase
        .from('Assigned_To')
        .delete()
        .eq('user_id', user.value.id)
        .in('task_id', taskIds)
    }

    const { error: leaveError } = await supabase
      .from('Joins')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.value.id)

    if (leaveError) {
      error.value = leaveError.message
      return false
    }

    await fetchCreatedRooms()
    await fetchJoinedRooms()
    return true
  }

  const deleteRoom = async (roomId: string): Promise<boolean> => {
    if (!user.value) return false
    error.value = null

    const { data: roomTasks, error: tasksError } = await supabase
      .from('Task')
      .select('task_id')
      .eq('task_room_id', roomId)

    if (tasksError) {
      error.value = tasksError.message
      return false
    }

    if (roomTasks && roomTasks.length > 0) {
      const taskIds = roomTasks.map((task: any) => task.task_id)

      const { error: assignedError } = await supabase
        .from('Assigned_To')
        .delete()
        .in('task_id', taskIds)

      if (assignedError) {
        error.value = assignedError.message
        return false
      }

      const { error: deleteTasksError } = await supabase
        .from('Task')
        .delete()
        .eq('task_room_id', roomId)

      if (deleteTasksError) {
        error.value = deleteTasksError.message
        return false
      }
    }

    const { error: joinError } = await supabase.from('Joins').delete().eq('room_id', roomId)

    if (joinError) {
      error.value = joinError.message
      return false
    }

    const { error: roomError } = await supabase.from('Room').delete().eq('room_id', roomId)

    if (roomError) {
      error.value = roomError.message
      return false
    }

    await fetchCreatedRooms()
    await fetchJoinedRooms()
    return true
  }

  const subscribeToRooms = () => {
    supabase
      .channel('room-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Room' }, () => {
        fetchCreatedRooms()
        fetchJoinedRooms()
      })
      .subscribe()
  }

  return {
    createdRooms,
    joinedRooms,
    isLoading,
    error,
    fetchCreatedRooms,
    fetchJoinedRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    subscribeToRooms,
  }
}
