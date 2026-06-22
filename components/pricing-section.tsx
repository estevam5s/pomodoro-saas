"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShineBorder } from "@/components/ui/shine-border"
import { getPlans, startCheckout } from "@/lib/billing"
import { supabase, Plan, brl } from "@/lib/supabase"

export function PricingSection({ currentSlug }: { currentSlug?: string }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [cycle, setCycle] = useState<"month" | "year">("month")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    getPlans().then((p) => { setPlans(p); setLoading(false) }).catch(() => setLoading(false))
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
  }, [])

  const handle = async (plan: Plan) => {
    if (plan.slug === "free") { window.location.href = authed ? "/dashboard" : "/signup"; return }
    try {
      setBusy(plan.slug)
      await startCheckout(plan.slug, cycle)
    } catch (e: any) {
      alert(e.message || "Erro ao iniciar checkout")
    } finally {
      setBusy(null)
    }
  }

  const priceFor = (plan: Plan) => {
    if (plan.price_month === 0) return { big: "R$ 0", sub: "para sempre" }
    if (cycle === "year") {
      const perMonth = Math.round(plan.price_year / 12)
      return { big: brl(perMonth), sub: `/mês · ${brl(plan.price_year)}/ano` + (plan.per_seat ? " por usuário" : "") }
    }
    return { big: brl(plan.price_month), sub: "/mês" + (plan.per_seat ? " por usuário" : "") }
  }

  const cta = (plan: Plan) => {
    if (currentSlug === plan.slug) return "Plano atual"
    if (plan.slug === "free") return "Começar grátis"
    if (plan.slug === "enterprise") return "Assinar Enterprise"
    return `Obter ${plan.name}`
  }

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4">Planos</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Preços simples e transparentes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Comece grátis. Em Reais, cancele quando quiser. Sem limites de armazenamento por GB.</p>
        </div>

        {/* toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cycle === "month" ? "text-white text-sm" : "text-gray-500 text-sm"}>Mensal</span>
          <button
            onClick={() => setCycle(cycle === "month" ? "year" : "month")}
            className="relative w-14 h-7 rounded-full bg-white/10 border border-white/10 transition"
            aria-label="Alternar ciclo"
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all ${cycle === "year" ? "left-7" : "left-0.5"}`} />
          </button>
          <span className={cycle === "year" ? "text-white text-sm" : "text-gray-500 text-sm"}>
            Anual <span className="text-green-400 font-medium">−20%</span>
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const p = priceFor(plan)
              const isCurrent = currentSlug === plan.slug
              const card = (
                <div className={`flex flex-col h-full p-6 rounded-xl ${plan.highlighted ? "bg-gradient-to-b from-white/[0.07] to-transparent" : ""}`}>
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      {plan.highlighted && <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wide">Popular</span>}
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl font-bold text-white">{p.big}</span>
                    </div>
                    <p className="text-xs text-gray-500 h-8">{p.sub}</p>
                    <p className="text-sm text-gray-400 mt-2 h-10">{plan.description}</p>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.slice(0, 7).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handle(plan)}
                    disabled={isCurrent || busy === plan.slug}
                    variant={plan.highlighted ? "default" : "outline"}
                    className={`w-full ${plan.highlighted ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90" : "border-white/10 bg-white/5 text-white hover:bg-white/10"} ${isCurrent ? "opacity-60" : ""}`}
                  >
                    {busy === plan.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : cta(plan)}
                  </Button>
                </div>
              )
              return plan.highlighted ? (
                <ShineBorder key={plan.slug} className="h-full" borderClassName="border border-red-500/40 rounded-xl">{card}</ShineBorder>
              ) : (
                <div key={plan.slug} className="h-full rounded-xl border border-white/10 bg-white/[0.02]">{card}</div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-8">
          Pagamentos processados com segurança via Stripe · Reembolso em até 7 dias (CDC art. 49) · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}
