import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidSession } from '@/lib/server/admin-auth'
import { dbGet } from '@/lib/server/firebase-admin'
import {
  FEATURES,
  normalizeTier,
  todayKey,
  type FeatureKey,
  type Tier,
} from '@/lib/tiers'

export const dynamic = 'force-dynamic'

type RawUser = {
  uid?: string
  name?: string
  email?: string
  plan?: string
  createdAt?: number
}

type UserRow = {
  uid: string
  name: string
  email: string
  tier: Tier
  createdAt: number
  usageToday: Record<FeatureKey, number>
}

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  return isValidSession(store.get(ADMIN_COOKIE)?.value)
}

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [users, usage] = await Promise.all([
    dbGet<Record<string, RawUser>>('users'),
    dbGet<Record<string, Record<string, Record<string, number>>>>('usage'),
  ])

  const day = todayKey()
  const rows: UserRow[] = Object.entries(users || {}).map(([uid, u]) => {
    const todayCounts = usage?.[uid]?.[day] || {}
    const usageToday = FEATURES.reduce((acc, f) => {
      acc[f] = Number(todayCounts[f]) || 0
      return acc
    }, {} as Record<FeatureKey, number>)

    return {
      uid,
      name: u?.name || 'Trader',
      email: u?.email || '',
      tier: normalizeTier(u?.plan),
      createdAt: Number(u?.createdAt) || 0,
      usageToday,
    }
  })

  rows.sort((a, b) => b.createdAt - a.createdAt)

  return Response.json({ users: rows, day })
}
