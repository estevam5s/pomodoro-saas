"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { AuthShell, Field, inputClass } from "@/components/auth/AuthShell"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres"); return }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    if (error) {
      setError(error.message?.includes("already registered") ? "Este e-mail já está cadastrado" : "Erro ao criar conta. Tente novamente.")
      setLoading(false)
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <AuthShell title="Criar sua conta" subtitle="Comece grátis no plano Inicial." perksTitle="Sua produtividade começa aqui." typing={typing} hasPwd={password.length > 0} showPwd={show}>
      <form onSubmit={handleSubmit} className="space-y-4" onFocus={() => setTyping(true)} onBlur={() => setTyping(false)}>
        {error && <div className="p-3.5 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span></div>}

        <Field label="Nome completo">
          <input type="text" required className={inputClass} placeholder="João Silva" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <input type="email" required className={inputClass} placeholder="voce@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" hint="mín. 6 caracteres">
          <div className="relative">
            <input type={show ? "text" : "password"} required className={inputClass + " pr-11"} placeholder="••••••••" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
        </Field>

        <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 text-base font-medium">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar conta grátis"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-400">
        Já tem uma conta? <Link href="/login" className="text-red-400 font-semibold hover:underline">Fazer login</Link>
      </p>
      <p className="mt-4 text-center"><Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300"><ArrowLeft className="w-4 h-4" /> Voltar ao site</Link></p>
    </AuthShell>
  )
}
