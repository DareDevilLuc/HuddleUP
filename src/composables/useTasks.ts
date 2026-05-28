import { ref } from 'vue'
import { supabase } from '../../utils/supabase'
import { useAuth } from './useAuth'

export interface TaskData {
    task_id : string
    title : string
    status_task : string
    completed_at : string | null
    task_created_at : string
    task_creator_id : string
    task_room_id : string
}


export function useTasks() {
    const { user } = useAuth()
    const assignedTasks = ref<TaskData[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    
    const fetchAssignedTasks = async (room_id : string) => {
       if(!user.value) return 
       isLoading.value = true
       error.value = null

       const { data, error: sbError } = await supabase
       .from('Assigned_To')
       .select('*, Task(*)')
       .eq('Task.task_room_id', room_id)
       .eq('user_id', user.value.id)

       if(sbError) {
        error.value = sbError.message
       } else if (data) {
        assignedTasks.value = data
            .map((item : any) => item.Task)
       }


       isLoading.value = false
    }

    return { fetchAssignedTasks, assignedTasks, isLoading, error}
}