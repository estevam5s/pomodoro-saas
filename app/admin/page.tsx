"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Users, DollarSign, Activity, ScrollText, LayoutDashboard, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InteractiveGrid } from "@/components/ui/interactive-grid"
import { supabase, isAdminEmail, brl } from "@/lib/supabase"

type Tab = "overview" | "users" | "finance" | "logs" | "health"
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "users", label: "Usuários", icon: Users },
  { id: "finance", label: "Financeiro", icon: DollarSign },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "health", label: "Saúde", icon: Activity },
]
const PLAN_OPTS = ["free", "starter", "pro", "enterprise"]

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("overview")
  const [cache, setCache] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const allowed = !authLoading && user && isAdminEmail(user.email)

  useEffect(() => {
    if (!authLoading && (!user || !isAdminEmail(user.email))) router.push("/dashboard")
  }, [user, authLoading, router])

  const headers = useCallback(async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession()
    const t = data.session?.access_token
    return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }
  }, [])

  const load = useCallback(async (m: Tab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin?module=${m}`, { headers: await headers() })
      const json = await res.json()
      setCache((c) => ({ ...c, [m]: json }))
    } catch { /* noop */ } finally { setLoading(false) }
  }, [headers])

  useEffect(() => { if (allowed) load(tab) }, [tab, allowed, load])

  const setPlan = async (user_id: string, slug: string) => {
    await fetch("/api/admin", { method: "POST", headers: await headers(), body: JSON.stringify({ action: "set_plan", user_id, slug }) })
    load("users")
  }
  const delUser = async (user_id: string) => {
    if (!confirm("Excluir este usuário? Ação irreversível.")) return
    await fetch("/api/admin", { method: "POST", headers: await headers(), body: JSON.stringify({ action: "delete_user", user_id }) })
    load("users")
  }

  if (authLoading || !allowed) {
    return <div className="min-h-screen bg-black grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
  }

  const d = cache[tab]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Painel
          </Link>
          <h1 className="text-lg font-bold text-white">Administração · FocusTimer</h1>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 border-t border-white/10 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition ${tab === t.id ? "text-white border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}>
                <t.icon className="w-4 h-4 inline mr-2" />{t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {loading && !d ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
        ) : (
          <>
            {tab === "overview" && d && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Stat label="Usuários" value={d.users} />
                  <Stat label="Pagantes" value={d.paying} />
                  <Stat label="MRR" value={brl(d.mrr || 0)} />
                  <Stat label="ARR" value={brl(d.arr || 0)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4">Usuários por plano</h3>
                    <div className="space-y-2">
                      {Object.entries(d.byPlan || {}).map(([slug, n]: any) => (
                        <div key={slug} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 capitalize">{slug}</span>
                          <span className="text-white font-medium">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4">Métricas</h3>
                    <div className="space-y-2 text-sm">
                      <Row k="ARPU (pagantes)" v={brl(d.arpu || 0)} />
                      <Row k="MRR" v={brl(d.mrr || 0)} />
                      <Row k="ARR" v={brl(d.arr || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "users" && d && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-400">
                    <tr><th className="text-left p-3">Usuário</th><th className="text-left p-3">Plano</th><th className="text-left p-3">Status</th><th className="text-right p-3">Ações</th></tr>
                  </thead>
                  <tbody>
                    {(d.users || []).map((u: any) => (
                      <tr key={u.id} className="border-t border-white/5">
                        <td className="p-3 text-white">{u.email}<div className="text-xs text-gray-500">{u.full_name}</div></td>
                        <td className="p-3">
                          <select value={u.plan} onChange={(e) => setPlan(u.id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs">
                            {PLAN_OPTS.map((p) => <option key={p} value={p} className="bg-black">{p}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-gray-300">{u.status}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => delUser(u.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "finance" && d && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Eventos de pagamento recentes</h3>
                <div className="space-y-2">
                  {(d.events || []).length === 0 && <p className="text-gray-500 text-sm">Nenhum evento ainda.</p>}
                  {(d.events || []).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between text-sm border-b border-white/5 py-2">
                      <span className="text-gray-300">{e.type}</span>
                      <span className="text-gray-500">{new Date(e.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "logs" && d && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Logs administrativos</h3>
                <div className="space-y-2">
                  {(d.logs || []).length === 0 && <p className="text-gray-500 text-sm">Nenhum log ainda.</p>}
                  {(d.logs || []).map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between text-sm border-b border-white/5 py-2">
                      <span className="text-gray-300">{l.action} <span className="text-gray-500">por {l.actor_email}</span></span>
                      <span className="text-gray-500">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "health" && d && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid sm:grid-cols-2 gap-3">
                <Row k="Stripe configurado" v={d.stripe ? "✅" : "❌"} />
                <Row k="Webhook configurado" v={d.webhook ? "✅" : "❌"} />
                <Row k="Supabase admin" v={d.supabase ? "✅" : "❌"} />
                <Row k="Horário do servidor" v={new Date(d.time).toLocaleString("pt-BR")} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="text-3xl font-bold text-white">{value ?? 0}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  )
}
function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex items-center justify-between"><span className="text-gray-400">{k}</span><span className="text-white font-medium">{v}</span></div>
}
