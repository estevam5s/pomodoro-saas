"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, CreditCard, Loader2, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InteractiveGrid } from "@/components/ui/interactive-grid"
import { PricingSection } from "@/components/pricing-section"
import { getMySubscription, openPortal, SubscriptionResponse } from "@/lib/billing"
import { brl } from "@/lib/supabase"

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<SubscriptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalBusy, setPortalBusy] = useState(false)

  useEffect(() => { if (!authLoading && !user) router.push("/login") }, [user, authLoading, router])
  useEffect(() => {
    if (user) getMySubscription().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const plan = data?.plan
  const sub = data?.subscription
  const isPaid = plan && plan.slug !== "free"
  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("pt-BR") : null

  const statusLabel: Record<string, string> = {
    active: "Ativo", trialing: "Em teste", past_due: "Pagamento pendente", canceled: "Cancelado", incomplete: "Incompleto",
  }

  const manage = async () => {
    try { setPortalBusy(true); await openPortal() } catch (e: any) { alert(e.message); setPortalBusy(false) }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-black grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <InteractiveGrid containerClassName="absolute inset-0" className="opacity-30" points={40} />

      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel
          </Link>
          <h1 className="text-lg font-bold text-white">Meu plano</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* plano atual */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isPaid && <Crown className="w-5 h-5 text-orange-400" />}
                <span className="text-sm text-gray-400">Plano atual</span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white">{plan?.name || "Inicial"}</h2>
                {sub && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {statusLabel[sub.status] || sub.status}
                  </span>
                )}
                {data?.is_admin && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">Admin</span>}
              </div>
              {isPaid && plan && (
                <p className="text-gray-400 text-sm mt-2">
                  {sub?.cycle === "year" ? brl(plan.price_year) + "/ano" : brl(plan.price_month) + "/mês"}
                  {periodEnd && <> · {sub?.cancel_at_period_end ? "encerra" : "renova"} em {periodEnd}</>}
                </p>
              )}
              {!isPaid && <p className="text-gray-400 text-sm mt-2">Você está no plano gratuito. Faça upgrade para liberar recursos avançados.</p>}
            </div>

            {isPaid && (
              <Button onClick={manage} disabled={portalBusy} className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                {portalBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Gerenciar assinatura</>}
              </Button>
            )}
          </div>

          {plan && plan.features?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10 grid sm:grid-cols-2 gap-2">
              {plan.features.slice(0, 8).map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* trocar de plano */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {isPaid ? "Trocar de plano" : "Faça upgrade"}
        </h3>
        <PricingSection currentSlug={data?.is_admin ? "enterprise" : plan?.slug} />
      </main>
    </div>
  )
}
