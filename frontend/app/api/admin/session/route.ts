import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidSession } from '@/lib/server/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const store = await cookies()
  const authed = isValidSession(store.get(ADMIN_COOKIE)?.value)
  return NextResponse.json({ authed })
}
