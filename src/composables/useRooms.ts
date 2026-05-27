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

export function useRooms() {
    const { user } = useAuth()
    const createdRooms = ref<RoomData[]>([])
    const joinedRooms = ref<RoomData[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

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
            .select(`
        room_id,
        Room ( * )
      `)
            .eq('user_id', user.value.id)

        if (sbError) {
            error.value = sbError.message
        } else if (data) {
            joinedRooms.value = data
                .map((item: any) => item.Room)
                .filter((room: RoomData) =>
                    room.status_room === 'active' && room.room_creator_id !== user.value?.id
                )
        }

        isLoading.value = false
    }

    // Create new room
    const createRoom = async (title: string) => {
        if (!user.value) return null
        isLoading.value = true
        error.value = null

        // Generate random code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()


        // 1. Insert into Room table
        const { data: roomData, error: roomError } = await supabase
            .from('Room')
            .insert([
                {
                    title: title,
                    room_code: roomCode,
                    room_creator_id: user.value.id,
                    status_room: 'active'
                }
            ])
            .select()
            .single()

        if (roomError) {
            error.value = roomError.message
            isLoading.value = false
            return null
        }

        // 2. Insert creator into Joins table
        const { error: joinError } = await supabase
            .from('Joins')
            .insert([
                {
                    room_id: roomData.room_id,
                    user_id: user.value.id,
                    role: 'admin'
                }
            ])

        if (joinError) {
            error.value = joinError.message
        } else {
            await fetchCreatedRooms()
        }

        isLoading.value = false
        return roomData
    }

    return {
        createdRooms,
        joinedRooms,
        isLoading,
        error,
        fetchCreatedRooms,
        fetchJoinedRooms,
        createRoom
    }
}