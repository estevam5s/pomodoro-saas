import { NextResponse } from 'next/server'
import { admin, getUser, isAdminEmail } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const db = admin()
  const { data: plans } = await db.from('plans').select('*').eq('active', true).order('sort')
  const { data: sub } = await db.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()

  const adminFlag = isAdminEmail(user.email)
  const slug = adminFlag ? 'enterprise' : (sub?.plan_slug || 'free')
  const plan = (plans || []).find((p: any) => p.slug === slug) || null

  return NextResponse.json({
    subscription: sub || null,
    plan,
    plans: plans || [],
    is_admin: adminFlag,
  })
}
