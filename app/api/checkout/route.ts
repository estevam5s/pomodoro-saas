import { NextResponse } from 'next/server'
import { admin, getUser, stripe, siteUrl } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug, cycle } = await req.json().catch(() => ({}))
  if (!slug || slug === 'free') {
    return NextResponse.json({ error: 'Plano gratuito não requer pagamento' }, { status: 400 })
  }

  const db = admin()
  const { data: plan } = await db.from('plans').select('*').eq('slug', slug).single()
  if (!plan) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  const price = cycle === 'year' ? plan.stripe_price_year : plan.stripe_price_month
  if (!price) return NextResponse.json({ error: 'Preço não configurado para este plano' }, { status: 400 })

  // Reutiliza/cria customer do Stripe
  const { data: sub } = await db.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
  let customer = sub?.stripe_customer_id as string | undefined
  if (!customer) {
    const c = await stripe().customers.create({ email: user.email!, metadata: { user_id: user.id } })
    customer = c.id
    await db.from('subscriptions').upsert(
      { user_id: user.id, plan_slug: sub?.plan_slug || 'free', stripe_customer_id: customer },
      { onConflict: 'user_id' },
    )
  }

  const site = siteUrl(req)
  const quantity = plan.per_seat ? (plan.limits?.seats || 3) : 1
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price, quantity }],
    success_url: `${site}/dashboard/billing?success=1`,
    cancel_url: `${site}/dashboard/billing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { user_id: user.id, slug, app: 'focustimer' } },
    metadata: { user_id: user.id, slug, cycle: cycle || 'month', app: 'focustimer' },
  })

  return NextResponse.json({ url: session.url })
}
