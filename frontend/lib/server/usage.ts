// SERVER-ONLY usage enforcement.
//
// Verifies the caller's Firebase ID token, looks up their tier, checks the
// per-tier daily limit, and (when allowed) increments the usage counter.
// Usage counters are written with the internal admin identity, so a user can
// never reset or lower their own count from the client/console.

import 'server-only'
import { verifyIdToken, dbGet, dbSet } from '@/lib/server/firebase-admin'
import {
  dailyLimit,
  hasAccess,
  isUnlimited,
  normalizeTier,
  todayKey,
  type FeatureKey,
  type Tier,
} from '@/lib/tiers'

export type ConsumeResult =
  | {
      ok: true
      tier: Tier
      used: number
      limit: number | null // null = unlimited
      remaining: number | null // null = unlimited
    }
  | {
      ok: false
      status: number
      error: string
      code: 'unauthenticated' | 'locked' | 'limit'
      tier?: Tier
      limit?: number | null
    }

export function bearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

async function getTier(uid: string): Promise<Tier> {
  const plan = await dbGet<string>(`users/${uid}/plan`)
  return normalizeTier(plan)
}

// Read-only view of a user's tier + today's counts (no increment).
export async function getUsageSnapshot(idToken: string | null) {
  const user = await verifyIdToken(idToken)
  if (!user) return null
  const tier = await getTier(user.uid)
  const day = todayKey()
  const counts =
    (await dbGet<Record<string, number>>(`usage/${user.uid}/${day}`)) || {}
  return { uid: user.uid, tier, day, counts }
}

// Access-only check for features that are gated but not credit-counted
// (e.g. News Signals): Free tier is denied, any paid tier is allowed.
export async function checkAccess(
  idToken: string | null,
): Promise<
  | { ok: true; tier: Tier }
  | { ok: false; status: number; error: string; code: 'unauthenticated' | 'locked'; tier?: Tier }
> {
  const user = await verifyIdToken(idToken)
  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'You must be signed in.',
      code: 'unauthenticated',
    }
  }
  const tier = await getTier(user.uid)
  if (!hasAccess(tier)) {
    return {
      ok: false,
      status: 403,
      error: 'Your Free account does not include access. Please upgrade.',
      code: 'locked',
      tier,
    }
  }
  return { ok: true, tier }
}

// Verify + enforce + increment for a single feature.
//
// `amount` is how many credits this call should consume (default 1). Tools
// that generate multiple items in one action (e.g. Future Signals) pass the
// number of items so each generated signal counts against the daily limit.
export async function consumeCredit(
  idToken: string | null,
  feature: FeatureKey,
  amount = 1,
): Promise<ConsumeResult> {
  const user = await verifyIdToken(idToken)
  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'You must be signed in.',
      code: 'unauthenticated',
    }
  }

  const tier = await getTier(user.uid)

  if (!hasAccess(tier)) {
    return {
      ok: false,
      status: 403,
      error: 'Your Free account does not include access. Please upgrade.',
      code: 'locked',
      tier,
    }
  }

  const qty = Math.max(1, Math.floor(amount))
  const day = todayKey()
  const path = `usage/${user.uid}/${day}/${feature}`
  const current = Number(await dbGet<number>(path)) || 0
  const limit = dailyLimit(tier)

  // Enforce the daily limit against the full requested amount so a batch can
  // never push usage past the cap.
  if (!isUnlimited(tier) && limit !== null && current + qty > limit) {
    const left = Math.max(0, limit - current)
    return {
      ok: false,
      status: 429,
      error:
        left <= 0
          ? `Daily limit reached. Your ${tier} plan allows ${limit} per day for this tool.`
          : `Not enough daily credits left. You requested ${qty} but only ${left} remain today on your ${tier} plan.`,
      code: 'limit',
      tier,
      limit,
    }
  }

  const next = current + qty
  await dbSet(path, next)

  return {
    ok: true,
    tier,
    used: next,
    limit,
    remaining: limit === null ? null : Math.max(0, limit - next),
  }
}

// Give a credit back when the work a credit was taken for failed (e.g. the AI
// provider was over capacity), so a user is never charged for a failed run.
export async function refundCredit(
  idToken: string | null,
  feature: FeatureKey,
  amount = 1,
): Promise<void> {
  try {
    const user = await verifyIdToken(idToken)
    if (!user) return
    const day = todayKey()
    const path = `usage/${user.uid}/${day}/${feature}`
    const current = Number(await dbGet<number>(path)) || 0
    await dbSet(path, Math.max(0, current - Math.max(1, Math.floor(amount))))
  } catch {
    /* a failed refund must never break the error response */
  }
}
