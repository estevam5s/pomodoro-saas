import { NextResponse } from 'next/server'
import { admin, getUser, stripe, siteUrl } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = admin()
  const { data: sub } = await db
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura paga encontrada' }, { status: 400 })
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl(req)}/dashboard/billing`,
  })

  return NextResponse.json({ url: session.url })
}
