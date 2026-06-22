import { createClient } from '@supabase/supabase-js'

// Validar que as variáveis de ambiente estão configuradas
// Durante o build, usa valores de fallback para evitar erros
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Cliente Supabase para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Função helper para validar configuração no runtime
export function validateSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Faltam as credenciais do Supabase nas variáveis de ambiente')
  }
}

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

export interface PlanLimits {
  projects: number
  tasks: number
  history_days: number
  devices: number
  presets: number
  advanced_stats?: boolean
  blocker?: boolean
  calendar?: boolean
  export?: string | false
  seats?: number
  admin?: boolean
  api?: boolean
}

export interface Plan {
  id: string
  slug: 'free' | 'starter' | 'pro' | 'enterprise'
  name: string
  description: string | null
  price_month: number
  price_year: number
  stripe_price_month: string | null
  stripe_price_year: string | null
  features: string[]
  limits: PlanLimits
  per_seat: boolean
  highlighted: boolean
  sort: number
  active: boolean
}

export interface Subscription {
  id: string
  user_id: string
  plan_slug: 'free' | 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  cycle: 'month' | 'year'
  seats: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  trial_end: string | null
  created_at: string
  updated_at: string
}

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase())

export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const isUnlimited = (n: number) => n === -1 || n === null || n === undefined

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
