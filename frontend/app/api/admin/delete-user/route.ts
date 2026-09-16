import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidSession } from '@/lib/server/admin-auth'
import { dbGet, dbDelete } from '@/lib/server/firebase-admin'

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

  let uid = ''
  let email = ''
  try {
    const body = (await req.json()) as { uid?: string; email?: string }
    uid = (body.uid || '').trim()
    email = (body.email || '').trim().toLowerCase()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // Resolve the uid: prefer explicit uid, otherwise look it up by email.
  if (!uid) {
    if (!email) {
      return Response.json(
        { error: 'A uid or email is required.' },
        { status: 400 },
      )
    }
    const users = (await dbGet<Record<string, RawUser>>('users')) || {}
    const match = Object.entries(users).find(
      ([, u]) => (u?.email || '').trim().toLowerCase() === email,
    )
    if (!match) {
      return Response.json(
        { error: 'No registered user found with that email.' },
        { status: 404 },
      )
    }
    uid = match[0]
  }

  // Remove both the profile and their usage counters.
  await Promise.all([dbDelete(`users/${uid}`), dbDelete(`usage/${uid}`)])

  return Response.json({ ok: true, uid })
}
