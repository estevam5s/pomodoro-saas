"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AuthExperience from "@/components/auth-experience"

export const dynamic = "force-dynamic"

const HERO = "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1400&q=80"

export default function SignupPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  async function onRegister({ name, email, password }: { name: string; email: string; password: string }) {
    const { error } = await signUp(email, password, name)
    if (error) return typeof error === "string" ? error : (error as Error).message || "Não foi possível criar a conta."
    router.push("/onboarding")
  }
  async function onGoogle() { await signInWithGoogle() }

  return (
    <AuthExperience
      mode="register"
      appName="Pomodoro"
      logoSrc="/brand-logo.png"
      siteUrl="/"
      loginUrl="/login"
      registerUrl="/signup"
      heroImageSrc={HERO}
      heroTagline="Foco total, um pomodoro de cada vez."
      accent="#ef4444"
      onRegister={onRegister}
      onGoogle={onGoogle}
    />
  )
}
