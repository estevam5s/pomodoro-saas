"use client"

import { useState, useEffect, useRef, ReactNode } from "react"
import Link from "next/link"
import { Check } from "lucide-react"

/* ===== olhos animados que seguem o cursor (adaptado de login.md) ===== */
function useMouse() {
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  return m
}

type EyeProps = { size?: number; pupil?: number; max?: number; blink?: boolean; lookX?: number; lookY?: number; mouse: { x: number; y: number } }
function EyeBall({ size = 18, pupil = 7, max = 5, blink = false, lookX, lookY, mouse }: EyeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pos = (() => {
    if (lookX !== undefined && lookY !== undefined) return { x: lookX, y: lookY }
    if (!ref.current) return { x: 0, y: 0 }
    const r = ref.current.getBoundingClientRect()
    const dx = mouse.x - (r.left + r.width / 2)
    const dy = mouse.y - (r.top + r.height / 2)
    const dist = Math.min(Math.hypot(dx, dy), max)
    const a = Math.atan2(dy, dx)
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist }
  })()
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center overflow-hidden transition-all duration-150"
      style={{ width: size, height: blink ? 2 : size, backgroundColor: "white" }}>
      {!blink && <div className="rounded-full" style={{ width: pupil, height: pupil, backgroundColor: "#1a1a1a", transform: `translate(${pos.x}px,${pos.y}px)`, transition: "transform .1s ease-out" }} />}
    </div>
  )
}

function Characters({ typing, hasPwd, showPwd }: { typing: boolean; hasPwd: boolean; showPwd: boolean }) {
  const mouse = useMouse()
  const [blinkA, setBlinkA] = useState(false)
  const [blinkB, setBlinkB] = useState(false)
  const [together, setTogether] = useState(false)
  const [peek, setPeek] = useState(false)
  const aRef = useRef<HTMLDivElement>(null)
  const bRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = () => { t = setTimeout(() => { setBlinkA(true); setTimeout(() => { setBlinkA(false); loop() }, 150) }, Math.random() * 4000 + 3000) }
    loop(); return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = () => { t = setTimeout(() => { setBlinkB(true); setTimeout(() => { setBlinkB(false); loop() }, 150) }, Math.random() * 4000 + 3500) }
    loop(); return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!typing) { setTogether(false); return }
    setTogether(true)
    const t = setTimeout(() => setTogether(false), 800)
    return () => clearTimeout(t)
  }, [typing])
  useEffect(() => {
    if (!(hasPwd && showPwd)) { setPeek(false); return }
    const t = setTimeout(() => { setPeek(true); setTimeout(() => setPeek(false), 800) }, Math.random() * 3000 + 2000)
    return () => clearTimeout(t)
  }, [hasPwd, showPwd, peek])

  const lean = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return 0
    const r = ref.current.getBoundingClientRect()
    return Math.max(-6, Math.min(6, -(mouse.x - (r.left + r.width / 2)) / 120))
  }
  const hidden = hasPwd && !showPwd
  const watching = hasPwd && showPwd

  return (
    <div className="relative" style={{ width: 480, height: 360 }}>
      {/* bloco vermelho (fundo) */}
      <div ref={aRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 60, width: 160, height: (typing || hidden) ? 390 : 360, background: "#ef4444", borderRadius: "12px 12px 0 0", zIndex: 1,
          transform: watching ? "skewX(0deg)" : (typing || hidden) ? `skewX(${lean(aRef) - 10}deg) translateX(34px)` : `skewX(${lean(aRef)}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-6 transition-all duration-700" style={{ left: watching ? 20 : together ? 48 : 40, top: watching ? 32 : together ? 56 : 38 }}>
          <EyeBall mouse={mouse} blink={blinkA} lookX={watching ? (peek ? 4 : -4) : together ? 3 : undefined} lookY={watching ? (peek ? 5 : -4) : together ? 4 : undefined} />
          <EyeBall mouse={mouse} blink={blinkA} lookX={watching ? (peek ? 4 : -4) : together ? 3 : undefined} lookY={watching ? (peek ? 5 : -4) : together ? 4 : undefined} />
        </div>
      </div>

      {/* bloco escuro (meio) */}
      <div ref={bRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 210, width: 108, height: 280, background: "#1f1f23", borderRadius: "10px 10px 0 0", zIndex: 2,
          transform: watching ? "skewX(0deg)" : together ? `skewX(${lean(bRef) * 1.5 + 10}deg) translateX(16px)` : `skewX(${lean(bRef) * 1.5}deg)`, transformOrigin: "bottom center" }}>
        <div className="absolute flex gap-5 transition-all duration-700" style={{ left: watching ? 10 : together ? 28 : 22, top: watching ? 24 : together ? 12 : 28 }}>
          <EyeBall mouse={mouse} size={15} pupil={6} max={4} blink={blinkB} lookX={watching ? -4 : together ? 0 : undefined} lookY={watching ? -4 : together ? -4 : undefined} />
          <EyeBall mouse={mouse} size={15} pupil={6} max={4} blink={blinkB} lookX={watching ? -4 : together ? 0 : undefined} lookY={watching ? -4 : together ? -4 : undefined} />
        </div>
      </div>

      {/* semicírculo laranja (frente esq.) */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 0, width: 210, height: 175, background: "#f97316", borderRadius: "105px 105px 0 0", zIndex: 3 }}>
        <div className="absolute flex gap-6" style={{ left: 72, top: 80 }}>
          <span className="rounded-full" style={{ width: 11, height: 11, background: "#1a1a1a" }} />
          <span className="rounded-full" style={{ width: 11, height: 11, background: "#1a1a1a" }} />
        </div>
      </div>

      {/* bloco âmbar (frente dir.) com sorriso */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 280, width: 124, height: 205, background: "#fbbf24", borderRadius: "62px 62px 0 0", zIndex: 4 }}>
        <div className="absolute flex gap-5" style={{ left: 46, top: 38 }}>
          <span className="rounded-full" style={{ width: 11, height: 11, background: "#1a1a1a" }} />
          <span className="rounded-full" style={{ width: 11, height: 11, background: "#1a1a1a" }} />
        </div>
        <div className="absolute rounded-full" style={{ left: 36, top: 80, width: 54, height: 4, background: "#1a1a1a" }} />
      </div>
    </div>
  )
}

const PERKS = ["Timer Pomodoro com foco e pausas", "Tarefas, metas e estatísticas", "Sincroniza em todos os dispositivos"]

export function AuthShell({
  title, subtitle, perksTitle, typing, hasPwd, showPwd, children,
}: {
  title: string; subtitle: string; perksTitle: string
  typing: boolean; hasPwd: boolean; showPwd: boolean; children: ReactNode
}) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-black">
      {/* lado visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-orange-700 text-white">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-black/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "22px 22px" }} />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /></svg>
          </div>
          <span className="text-lg font-bold">FocusTimer</span>
        </Link>

        <div className="relative z-10 flex items-end justify-center">
          <Characters typing={typing} hasPwd={hasPwd} showPwd={showPwd} />
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-2xl font-bold leading-snug">{perksTitle}</h2>
          <ul className="mt-5 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-white/85">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-white/20"><Check className="w-3 h-3" /></span>{p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /></svg>
            </div>
            <span className="text-xl font-bold text-white">FocusTimer</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-gray-400 text-sm mt-1.5 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

/* campo com label acima — legível, alto contraste */
export function Field({ label, hint, trailing, children }: { label: string; hint?: string; trailing?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-300">{label}{hint && <span className="ml-1.5 text-xs font-normal text-gray-500">({hint})</span>}</span>
        {trailing}
      </span>
      {children}
    </label>
  )
}

export const inputClass =
  "w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
