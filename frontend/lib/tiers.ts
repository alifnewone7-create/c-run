// Shared tier + usage configuration. Safe to import from both client and
// server code (contains no secrets).

export type Tier = 'free' | 'basic' | 'standard' | 'premium' | 'admin'

export type FeatureKey =
  | 'otc-chart-analyzer'
  | 'real-chart-analyzer'
  | 'future-signals'
  | 'live-signals'

// The four features that consume a daily credit.
export const FEATURES: FeatureKey[] = [
  'otc-chart-analyzer',
  'real-chart-analyzer',
  'future-signals',
  'live-signals',
]

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  'otc-chart-analyzer': 'OTC Chart Analyzer',
  'real-chart-analyzer': 'Real Chart Analyzer',
  'future-signals': 'Future Signals',
  'live-signals': 'Live Signals',
}

export const TIER_ORDER: Tier[] = ['free', 'basic', 'standard', 'premium', 'admin']

export const TIER_LABEL: Record<Tier, string> = {
  free: 'Free',
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  admin: 'Admin',
}

// Per-feature daily limit for each tier.
// - 0    => no access at all (free tier is fully locked)
// - null => unlimited (admin)
export const TIER_DAILY_LIMIT: Record<Tier, number | null> = {
  free: 0,
  basic: 20,
  standard: 35,
  premium: 50,
  admin: null,
}

export function normalizeTier(value: unknown): Tier {
  if (
    value === 'free' ||
    value === 'basic' ||
    value === 'standard' ||
    value === 'premium' ||
    value === 'admin'
  ) {
    return value
  }
  return 'free'
}

// Daily limit for a tier. null = unlimited.
export function dailyLimit(tier: Tier): number | null {
  return TIER_DAILY_LIMIT[tier]
}

// Whether the tier can use any generation feature at all.
export function hasAccess(tier: Tier): boolean {
  return tier !== 'free'
}

export function isUnlimited(tier: Tier): boolean {
  return TIER_DAILY_LIMIT[tier] === null
}

export function isValidFeature(value: unknown): value is FeatureKey {
  return typeof value === 'string' && (FEATURES as string[]).includes(value)
}

// --- Daily quota window -----------------------------------------------------
// All accounts share a single daily window that resets at 6:00 AM Bangladesh
// Standard Time (UTC+06:00). Because BST is UTC+6 and the reset hour is 6 AM,
// the window boundary lands exactly on 00:00 UTC — but we compute it from the
// constants below so it stays correct if the reset hour ever changes.
export const BST_UTC_OFFSET_HOURS = 6
export const RESET_HOUR_BST = 6

// Human-readable note shown wherever we tell users when their quota refreshes.
export const QUOTA_RESET_NOTE =
  'Your daily quota refreshes every morning after 6:00 AM Bangladesh Standard Time (UTC+06:00).'

// Stable day key shared by client and server. The window rolls over the moment
// the BST wall-clock passes the reset hour.
export function todayKey(date: Date = new Date()): string {
  const shiftHours = BST_UTC_OFFSET_HOURS - RESET_HOUR_BST
  const shifted = new Date(date.getTime() + shiftHours * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 10) // YYYY-MM-DD
}
