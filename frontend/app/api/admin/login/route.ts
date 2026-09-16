import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionValue,
  verifyCredentials,
} from '@/lib/server/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let username = ''
  let password = ''
  let secretKey = ''
  try {
    const body = (await req.json()) as {
      username?: string
      password?: string
      secretKey?: string
    }
    username = body.username ?? ''
    password = body.password ?? ''
    secretKey = body.secretKey ?? ''
  } catch {
    // fall through to invalid-credentials response
  }

  if (!verifyCredentials(username, password, secretKey)) {
    return NextResponse.json(
      { error: 'Invalid username, password, or secret key.' },
      { status: 401 },
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return res
}
