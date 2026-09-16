'use client'

import {
  ScanLine,
  CandlestickChart,
  Radar,
  RadioTower,
  Infinity as InfinityIcon,
  Lock,
  Gauge,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import {
  FEATURES,
  FEATURE_LABEL,
  TIER_LABEL,
  type FeatureKey,
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

const FEATURE_ICON: Record<
  FeatureKey,
  React.ComponentType<{ className?: string }>
> = {
  'otc-chart-analyzer': ScanLine,
  'real-chart-analyzer': CandlestickChart,
  'future-signals': Radar,
  'live-signals': RadioTower,
}

export function UsageOverview() {
  const { loading, tier, hasAccess, isUnlimited, limit, usage } = useAuth()

  return (
    <section className="border-luxe surface-luxe card-corner-glow relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Gauge className="h-[1.1rem] w-[1.1rem]" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Daily Usage</h2>
            <p className="text-xs text-muted-foreground">
              Limits reset every day · updates live
            </p>
          </div>
        </div>

        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
            hasAccess
              ? 'bg-primary/15 text-primary'
              : 'bg-input/40 text-muted-foreground',
          )}
        >
          {isUnlimited && <InfinityIcon className="h-3 w-3" />}
          {TIER_LABEL[tier]}
        </span>
      </div>

      {loading ? (
        <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f}
              className="h-[74px] animate-pulse rounded-2xl border border-border/60 bg-input/20"
            />
          ))}
        </div>
      ) : !hasAccess ? (
        <div className="relative mt-5 flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-input/10 p-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">Free account — no generations</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            You can open every page, but generating signals and analyses requires a
            paid plan. Upgrade to unlock a daily quota on all four tools.
          </p>
        </div>
      ) : (
        <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <UsageCard
              key={f}
              feature={f}
              used={usage[f] || 0}
              limit={limit}
              unlimited={isUnlimited}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function UsageCard({
  feature,
  used,
  limit,
  unlimited,
}: {
  feature: FeatureKey
  used: number
  limit: number | null
  unlimited: boolean
}) {
  const Icon = FEATURE_ICON[feature]
  const remaining = unlimited || limit === null ? null : Math.max(0, limit - used)
  const pct =
    unlimited || limit === null || limit === 0
      ? 100
      : Math.min(100, Math.round((used / limit) * 100))
  const depleted = remaining !== null && remaining <= 0

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-input/15 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold leading-tight">
            {FEATURE_LABEL[feature]}
          </p>
        </div>
        {unlimited ? (
          <span className="flex items-center gap-1 font-mono text-sm font-bold text-primary">
            <InfinityIcon className="h-4 w-4" />
          </span>
        ) : (
          <span
            className={cn(
              'font-mono text-sm font-bold tabular-nums',
              depleted ? 'text-down' : 'text-foreground',
            )}
          >
            {used}
            <span className="text-muted-foreground">/{limit}</span>
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-input/60">
        <span
          className={cn(
            'block h-full rounded-full transition-all duration-500',
            unlimited ? 'bg-primary' : depleted ? 'bg-down' : 'bg-accent',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        {unlimited
          ? 'Unlimited generations'
          : depleted
            ? 'Daily limit reached'
            : `${remaining} left today`}
      </p>
    </div>
  )
}
