import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidSession } from '@/lib/server/admin-auth'
import { dbGet, dbUpdate } from '@/lib/server/firebase-admin'
import { normalizeTier, TIER_ORDER, type Tier } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

type RawUser = { uid?: string; email?: string; name?: string }

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  return isValidSession(store.get(ADMIN_COOKIE)?.value)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let email = ''
  let reqUid = ''
  let tier: Tier = 'free'
  try {
    const body = (await req.json()) as {
      email?: string
      uid?: string
      tier?: string
    }
    email = (body.email || '').trim().toLowerCase()
    reqUid = (body.uid || '').trim()
    if (!TIER_ORDER.includes(body.tier as Tier)) {
      return Response.json({ error: 'Invalid tier.' }, { status: 400 })
    }
    tier = normalizeTier(body.tier)
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!email && !reqUid) {
    return Response.json(
      { error: 'A uid or email is required.' },
      { status: 400 },
    )
  }

  // Find the user by uid (preferred) or by matching email (case-insensitive).
  const users = (await dbGet<Record<string, RawUser>>('users')) || {}
  const match = reqUid
    ? (users[reqUid]
        ? ([reqUid, users[reqUid]] as [string, RawUser])
        : undefined)
    : Object.entries(users).find(
        ([, u]) => (u?.email || '').trim().toLowerCase() === email,
      )

  if (!match) {
    return Response.json(
      { error: 'No registered user found.' },
      { status: 404 },
    )
  }

  const [uid, user] = match
  await dbUpdate(`users/${uid}`, { plan: tier })

  return Response.json({
    ok: true,
    uid,
    email: user.email,
    name: user.name,
    tier,
  })
}
