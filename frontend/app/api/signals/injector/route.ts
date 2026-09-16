import { bearerToken, consumeCredit } from '@/lib/server/usage'

export const dynamic = 'force-dynamic'

const DURATIONS = [2, 5, 10]

// Direction is decided on the server so a signal can never be produced
// without consuming a daily Injector credit.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { duration?: number }
  const duration = Number(body.duration)
  if (!DURATIONS.includes(duration)) {
    return Response.json({ error: 'Invalid duration.' }, { status: 400 })
  }

  const gate = await consumeCredit(bearerToken(req), 'injector')
  if (!gate.ok) {
    return Response.json(
      { error: gate.error, code: gate.code, tier: gate.tier },
      { status: gate.status },
    )
  }

  return Response.json({
    direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
    duration,
    tier: gate.tier,
    used: gate.used,
    limit: gate.limit,
    remaining: gate.remaining,
  })
}
