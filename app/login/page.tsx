"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AuthExperience from "@/components/auth-experience"

export const dynamic = "force-dynamic"

const HERO = "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400&q=80" // foco/produtividade

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()

  async function onLogin(email: string, password: string) {
    const { error } = await signIn(email, password)
    if (error) return "E-mail ou senha incorretos."
    router.push("/dashboard")
  }
  async function onGoogle() { await signInWithGoogle() }

  return (
    <AuthExperience
      mode="login"
      appName="Pomodoro"
      logoSrc="/brand-logo.png"
      siteUrl="/"
      loginUrl="/login"
      registerUrl="/signup"
      heroImageSrc={HERO}
      heroTagline="Foco total, um pomodoro de cada vez."
      accent="#ef4444"
      onLogin={onLogin}
      onGoogle={onGoogle}
    />
  )
}
