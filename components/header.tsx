"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const NAV = [
  { href: "#features", label: "Recursos" },
  { href: "#how-it-works", label: "Como Funciona" },
  { href: "#testimonials", label: "Depoimentos" },
  { href: "#pricing", label: "Preços" },
  { href: "#faq", label: "FAQ" },
]

export function Header() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(!!data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-medium text-white">FocusTimer</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
            Recursos
          </Link>
          <Link href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
            Como Funciona
          </Link>
          <Link href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">
            Depoimentos
          </Link>
          <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Preços
          </Link>
          <Link href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>
        {authed ? (
          <Link href="/dashboard" className="hidden md:block">
            <Button variant="secondary" className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
              Acessar Painel
            </Button>
          </Link>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-200 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
                Criar conta
              </Button>
            </Link>
          </div>
        )}

        {/* hamburguer (mobile) */}
        <button onClick={() => setMenuOpen(true)} aria-label="Abrir menu" className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10 md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* menu mobile FULL-SCREEN (ocupa a tela toda) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex min-h-dvh w-full flex-col bg-black px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /></svg>
              </div>
              <span className="font-medium text-white">FocusTimer</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="grid size-12 place-items-center rounded-full text-white hover:bg-white/10">
              <X className="h-8 w-8" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-between pb-8 pt-14">
            <nav className="flex flex-col gap-8">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-4xl font-semibold leading-none text-white transition-opacity hover:opacity-70">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              {authed ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-xl font-semibold text-white">Acessar Painel</Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex h-14 items-center justify-center rounded-2xl border border-white/15 text-lg font-medium text-white">Entrar</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-xl font-semibold text-white">Criar conta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
