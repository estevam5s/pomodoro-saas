import { createClient } from '@supabase/supabase-js'

// Validar que as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as credenciais do Supabase nas variáveis de ambiente')
}

// Cliente Supabase para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types para TypeScript
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  work_duration: number
  short_break_duration: number
  long_break_duration: number
  sessions_until_long_break: number
  main_project: string | null
  project_type: string | null
  daily_goal: number
  enable_notifications: boolean
  enable_sound: boolean
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  session_type: 'work' | 'short_break' | 'long_break'
  duration: number
  completed: boolean
  task_description: string | null
  project_name: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface DailyStatistics {
  id: string
  user_id: string
  date: string
  total_pomodoros: number
  total_work_time: number
  total_break_time: number
  completed_tasks: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  estimated_pomodoros: number
  actual_pomodoros: number
  priority: 'low' | 'medium' | 'high'
  project_name: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
