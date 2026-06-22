"use client"

import { supabase, Plan, Subscription, PlanLimits } from '@/lib/supabase'

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

/** Planos ativos (leitura pública). */
export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase.from('plans').select('*').eq('active', true).order('sort')
  if (error) throw error
  return (data || []) as unknown as Plan[]
}

export type SubscriptionResponse = {
  subscription: Subscription | null
  plan: Plan | null
  plans: Plan[]
  is_admin: boolean
}

/** Assinatura atual + plano resolvido. */
export async function getMySubscription(): Promise<SubscriptionResponse> {
  const res = await fetch('/api/subscription', { headers: await authHeaders() })
  if (!res.ok) throw new Error('Falha ao carregar assinatura')
  return res.json()
}

/** Inicia checkout do Stripe. Redireciona para login se não autenticado. */
export async function startCheckout(slug: string, cycle: 'month' | 'year' = 'month') {
  const { data } = await supabase.auth.getSession()
  if (!data.session) { window.location.href = `/signup?next=pricing`; return }
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ slug, cycle }),
  })
  const json = await res.json()
  if (json.url) window.location.href = json.url
  else throw new Error(json.error || 'Falha ao iniciar checkout')
}

/** Abre o portal de cobrança do Stripe. */
export async function openPortal() {
  const res = await fetch('/api/portal', { method: 'POST', headers: await authHeaders() })
  const json = await res.json()
  if (json.url) window.location.href = json.url
  else throw new Error(json.error || 'Falha ao abrir portal')
}

// ===== Gating helpers =====
export const isUnlimited = (n: number) => n === -1 || n === null || n === undefined

export function canAdd(limit: number, current: number): boolean {
  if (isUnlimited(limit)) return true
  return current < limit
}

export function limitLabel(n: number): string {
  return isUnlimited(n) ? 'Ilimitado' : String(n)
}

export function hasFeature(limits: PlanLimits | undefined, key: keyof PlanLimits): boolean {
  if (!limits) return false
  return !!limits[key]
}
