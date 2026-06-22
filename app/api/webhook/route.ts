import { NextResponse } from 'next/server'
import { admin, stripe } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const body = await req.text()

  let event: any
  try {
    if (secret) event = stripe().webhooks.constructEvent(body, sig, secret)
    else event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const db = admin()

  // idempotência
  const { data: seen } = await db.from('payment_events').select('id').eq('id', event.id).maybeSingle()
  if (seen) return NextResponse.json({ received: true, duplicate: true })

  const slugFromPrice = async (priceId?: string) => {
    if (!priceId) return undefined
    const { data } = await db
      .from('plans')
      .select('slug')
      .or(`stripe_price_month.eq.${priceId},stripe_price_year.eq.${priceId}`)
      .maybeSingle()
    return data?.slug as string | undefined
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object
      const userId = s.metadata?.user_id
      const slug = s.metadata?.slug
      const cycle = s.metadata?.cycle || 'month'
      if (userId) {
        let periodEnd: string | null = null
        let subId: string | null = s.subscription || null
        if (subId) {
          const full: any = await stripe().subscriptions.retrieve(subId)
          if (full?.current_period_end) periodEnd = new Date(full.current_period_end * 1000).toISOString()
        }
        await db.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_slug: slug,
            status: 'active',
            cycle,
            stripe_customer_id: s.customer,
            stripe_subscription_id: subId,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      const customer = sub.customer
      const priceId = sub.items?.data?.[0]?.price?.id
      const updates: any = {
        status: event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        stripe_subscription_id: sub.id,
        updated_at: new Date().toISOString(),
      }
      if (event.type === 'customer.subscription.deleted') {
        updates.plan_slug = 'free'
      } else {
        const slug = await slugFromPrice(priceId)
        if (slug) updates.plan_slug = slug
      }
      await db.from('subscriptions').update(updates).eq('stripe_customer_id', customer)
    }

    await db.from('payment_events').insert({ id: event.id, type: event.type, payload: event })
  } catch (e) {
    console.error('webhook handler error', e)
    return NextResponse.json({ error: 'handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
