import { bearerToken, consumeCredit } from '@/lib/server/usage'

export const dynamic = 'force-dynamic'

type Pick = {
  direction: 'UP' | 'DOWN'
  offsetMin: number // minutes from "now" for this entry
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate the future signal queue on the server so a client cannot fabricate
// signals without consuming a daily credit.
export async function POST(req: Request) {
  let count = 5
  try {
    const body = (await req.json()) as { count?: number }
    if (typeof body.count === 'number' && Number.isFinite(body.count)) {
      count = Math.min(20, Math.max(1, Math.floor(body.count)))
    }
  } catch {
    // Ignore malformed body; use default count.
  }

  // Each generated signal consumes one daily credit.
  const gate = await consumeCredit(bearerToken(req), 'future-signals', count)
  if (!gate.ok) {
    return Response.json(
      { error: gate.error, code: gate.code, tier: gate.tier },
      { status: gate.status },
    )
  }

  let offset = randInt(2, 5)
  const picks: Pick[] = Array.from({ length: count }, () => {
    const pick: Pick = {
      direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
      offsetMin: offset,
    }
    offset += randInt(2, 10)
    return pick
  })

  return Response.json({
    picks,
    tier: gate.tier,
    used: gate.used,
    limit: gate.limit,
    remaining: gate.remaining,
  })
}
