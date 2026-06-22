import Stripe from 'stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ===== Stripe (lazy) =====
let _stripe: Stripe | null = null
export function stripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY ausente')
    _stripe = new Stripe(key, { apiVersion: '2024-06-20' as any })
  }
  return _stripe
}

// ===== Supabase admin (service role, lazy) =====
let _admin: SupabaseClient | null = null
export function admin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE
    if (!url || !key) throw new Error('Credenciais do Supabase admin ausentes')
    _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return _admin
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)

export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase())

export function siteUrl(req?: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL
  if (env) return env.replace(/\/$/, '')
  if (req) { try { return new URL(req.url).origin } catch { /* noop */ } }
  return 'http://localhost:2999'
}

/** Valida o Bearer token do Supabase enviado pelo cliente. */
export async function getUser(req: Request) {
  const authz = req.headers.get('authorization') || ''
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : null
  if (!token) return null
  const { data, error } = await admin().auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

export async function requireAdmin(req: Request) {
  const user = await getUser(req)
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
}
