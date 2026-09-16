import { NextResponse } from 'next/server'
import { bearerToken, checkAccess } from '@/lib/server/usage'

// Forex Factory economic calendar feed (this week).
const FEED_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json'

// Per-user access gating makes this route dynamic; the upstream feed itself
// is still cached for 10 minutes via the fetch below.
const FEED_REVALIDATE = 600

type RawEvent = {
  title: string
  country: string // currency code, e.g. "USD"
  date: string // ISO timestamp
  impact: string // "High" | "Medium" | "Low" | "Holiday"
  forecast: string
  previous: string
}

export type NewsImpact = 'high' | 'medium' | 'low' | 'holiday'

export type NewsEvent = {
  id: string
  title: string
  currency: string
  date: string // ISO
  impact: NewsImpact
  forecast: string
  previous: string
  // Fundamental prediction
  direction: 'UP' | 'DOWN' | 'NEUTRAL'
  confidence: number
  reasoning: string
  forecastNum: number | null
  previousNum: number | null
}

// Indicators where a HIGHER reading is BAD for the currency (inverse logic).
const INVERSE_KEYWORDS = [
  'unemployment',
  'jobless',
  'claims',
  'deficit',
  'inventories',
  'inventory',
  'delinquenc',
  'foreclosure',
  'misery',
]

function normImpact(raw: string): NewsImpact {
  const v = (raw || '').toLowerCase()
  if (v.includes('high')) return 'high'
  if (v.includes('medium')) return 'medium'
  if (v.includes('holiday')) return 'holiday'
  return 'low'
}

// Parse values like "3.2%", "250K", "-1.2", "1.5B", "1,024" into a number.
function parseNum(raw: string): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/,/g, '').trim()
  const match = cleaned.match(/-?\d+(\.\d+)?/)
  if (!match) return null
  let n = parseFloat(match[0])
  if (Number.isNaN(n)) return null
  if (/k/i.test(cleaned)) n *= 1_000
  else if (/m/i.test(cleaned)) n *= 1_000_000
  else if (/b/i.test(cleaned)) n *= 1_000_000_000
  return n
}

function predict(ev: RawEvent, impact: NewsImpact) {
  const forecastNum = parseNum(ev.forecast)
  const previousNum = parseNum(ev.previous)
  const isInverse = INVERSE_KEYWORDS.some((k) => ev.title.toLowerCase().includes(k))

  let direction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL'
  let confidence = 0
  let reasoning = ''

  if (impact === 'holiday') {
    return {
      direction: 'NEUTRAL' as const,
      confidence: 0,
      reasoning: 'Bank holiday — low liquidity, no directional bias expected.',
      forecastNum,
      previousNum,
    }
  }

  if (forecastNum === null || previousNum === null) {
    // No numeric comparison possible; give a soft impact-based read.
    const base = impact === 'high' ? 55 : impact === 'medium' ? 50 : 45
    return {
      direction: 'NEUTRAL' as const,
      confidence: base,
      reasoning:
        'No forecast/previous figures published — watch the actual release for volatility rather than a set direction.',
      forecastNum,
      previousNum,
    }
  }

  const diff = forecastNum - previousNum
  const denom = Math.abs(previousNum) || 1
  const pct = Math.abs(diff / denom)

  // Base confidence scales with impact + magnitude of change.
  const impactBase = impact === 'high' ? 72 : impact === 'medium' ? 66 : 60
  confidence = Math.min(90, Math.round(impactBase + Math.min(pct, 1) * 15))

  if (diff === 0) {
    direction = 'NEUTRAL'
    confidence = Math.max(50, confidence - 15)
    reasoning = `Forecast matches previous (${ev.previous}). Market likely already priced in — expect muted movement unless the actual figure surprises.`
    return { direction, confidence, reasoning, forecastNum, previousNum }
  }

  const forecastBetter = isInverse ? diff < 0 : diff > 0
  direction = forecastBetter ? 'UP' : 'DOWN'

  const curr = ev.country
  const trend = diff > 0 ? 'rise' : 'fall'
  reasoning = isInverse
    ? `Forecast ${trend}s from ${ev.previous} to ${ev.forecast}. For "${ev.title}" a lower reading is stronger, so this leans ${direction === 'UP' ? 'bullish' : 'bearish'} for ${curr}.`
    : `Forecast ${trend}s from ${ev.previous} to ${ev.forecast}. A higher reading typically strengthens ${curr}, so the bias leans ${direction === 'UP' ? 'bullish' : 'bearish'}.`

  return { direction, confidence, reasoning, forecastNum, previousNum }
}

export async function GET(req: Request) {
  try {
    const gate = await checkAccess(bearerToken(req))
    if (!gate.ok) {
      return NextResponse.json(
        { error: gate.error, code: gate.code, tier: gate.tier },
        { status: gate.status },
      )
    }

    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (SweetexAI news signals)' },
      next: { revalidate: FEED_REVALIDATE },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Feed responded with ${res.status}` },
        { status: 502 },
      )
    }

    const raw = (await res.json()) as RawEvent[]
    const now = new Date()

    const events: NewsEvent[] = raw
      .map((ev, i): NewsEvent => {
        const impact = normImpact(ev.impact)
        const p = predict(ev, impact)
        return {
          id: `${ev.country}-${ev.date}-${i}`,
          title: ev.title,
          currency: ev.country,
          date: ev.date,
          impact,
          forecast: ev.forecast || '',
          previous: ev.previous || '',
          ...p,
        }
      })
      .filter((ev) => !Number.isNaN(new Date(ev.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events, updatedAt: now.toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Failed to load the economic calendar.', detail: message },
      { status: 500 },
    )
  }
}
