import { NextResponse } from 'next/server'
import { admin, requireAdmin } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const actor = await requireAdmin(req)
  if (!actor) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const db = admin()
  const module = new URL(req.url).searchParams.get('module') || 'overview'

  if (module === 'overview') {
    const { data: subs } = await db.from('subscriptions').select('plan_slug,status,cycle')
    const { data: plans } = await db.from('plans').select('slug,price_month,price_year')
    const priceMap: Record<string, any> = Object.fromEntries((plans || []).map((p: any) => [p.slug, p]))
    const byPlan: Record<string, number> = {}
    let mrr = 0
    for (const s of subs || []) {
      byPlan[s.plan_slug] = (byPlan[s.plan_slug] || 0) + 1
      if (['active', 'trialing'].includes(s.status) && s.plan_slug !== 'free') {
        const p = priceMap[s.plan_slug]
        if (p) mrr += s.cycle === 'year' ? p.price_year / 12 : p.price_month
      }
    }
    const users = subs?.length || 0
    const paying = (subs || []).filter((s: any) => s.plan_slug !== 'free' && ['active', 'trialing'].includes(s.status)).length
    return NextResponse.json({
      users,
      paying,
      byPlan,
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      arpu: paying ? Math.round(mrr / paying) : 0,
    })
  }

  if (module === 'users') {
    const { data: subs } = await db.from('subscriptions').select('*')
    const { data } = await db.auth.admin.listUsers({ perPage: 200 })
    const map: Record<string, any> = Object.fromEntries((subs || []).map((s: any) => [s.user_id, s]))
    const rows = (data?.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      plan: map[u.id]?.plan_slug || 'free',
      status: map[u.id]?.status || 'active',
    }))
    return NextResponse.json({ users: rows })
  }

  if (module === 'finance') {
    const { data: events } = await db
      .from('payment_events')
      .select('id,type,created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ events: events || [] })
  }

  if (module === 'logs') {
    const { data: logs } = await db
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ logs: logs || [] })
  }

  if (module === 'health') {
    return NextResponse.json({
      ok: true,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabase: !!process.env.SUPABASE_SERVICE_ROLE,
      time: new Date().toISOString(),
    })
  }

  return NextResponse.json({ error: 'módulo inválido' }, { status: 400 })
}

export async function POST(req: Request) {
  const actor = await requireAdmin(req)
  if (!actor) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { action, user_id, slug } = await req.json().catch(() => ({}))
  const db = admin()

  if (action === 'set_plan' && user_id && slug) {
    await db.from('subscriptions').upsert(
      { user_id, plan_slug: slug, status: 'active', updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    await db.from('admin_logs').insert({ actor_email: actor.email, action: 'set_plan', target: user_id, meta: { slug } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete_user' && user_id) {
    await db.auth.admin.deleteUser(user_id)
    await db.from('admin_logs').insert({ actor_email: actor.email, action: 'delete_user', target: user_id })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'ação inválida' }, { status: 400 })
}
