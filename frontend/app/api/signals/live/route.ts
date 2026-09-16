import { bearerToken, consumeCredit } from '@/lib/server/usage'

export const dynamic = 'force-dynamic'

// Generate the live signal direction on the server so a client cannot produce
// a signal without consuming a daily credit.
export async function POST(req: Request) {
  const gate = await consumeCredit(bearerToken(req), 'live-signals')
  if (!gate.ok) {
    return Response.json(
      { error: gate.error, code: gate.code, tier: gate.tier },
      { status: gate.status },
    )
  }

  return Response.json({
    direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
    tier: gate.tier,
    used: gate.used,
    limit: gate.limit,
    remaining: gate.remaining,
  })
}
