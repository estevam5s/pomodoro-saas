"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, UserPreferences } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  preferences: UserPreferences | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  refreshPreferences: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }

  // Buscar preferências do usuário
  const fetchPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Preferências não existem ainda, usuário precisa fazer onboarding
        return null
      }

      if (error) throw error
      setPreferences(data)
    } catch (error) {
      console.error('Erro ao buscar preferências:', error)
    }
  }

  // Refresh das preferências (útil após onboarding)
  const refreshPreferences = async () => {
    if (user) {
      await fetchPreferences(user.id)
    }
  }

  // Monitorar mudanças na autenticação
  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
        fetchPreferences(session.user.id)
      }

      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
        await fetchPreferences(session.user.id)
      } else {
        setProfile(null)
        setPreferences(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) return { error }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return { error }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setPreferences(null)
    router.push('/')
  }

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  // Atualizar preferências
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)

    if (!error) {
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const value = {
    user,
    profile,
    preferences,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePreferences,
    refreshPreferences,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
