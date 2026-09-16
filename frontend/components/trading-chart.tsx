'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Gauge,
  ScanLine,
  ScanSearch,
  Telescope,
  Radio,
  RefreshCw,
  Info,
  Lock,
  Infinity as InfinityIcon,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { FEATURES, FEATURE_LABEL, TIER_LABEL, type FeatureKey } from '@/lib/tiers'
import { cn } from '@/lib/utils'

const FEATURE_ICON: Record<FeatureKey, LucideIcon> = {
  'otc-chart-analyzer': ScanLine,
  'real-chart-analyzer': ScanSearch,
  'future-signals': Telescope,
  'live-signals': Radio,
}

const FEATURE_COLOR: Record<FeatureKey, string> = {
  'otc-chart-analyzer': 'var(--primary)',
  'real-chart-analyzer': 'var(--emerald)',
  'future-signals': 'var(--gold)',
  'live-signals': 'var(--primary)',
}

export function TradingChart() {
  const { loading, tier, hasAccess, isUnlimited, limit, usage } = useAuth()
  const [infoOpen, setInfoOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Lock body scroll + Escape-to-close while the info dialog is open
  useEffect(() => {
    if (!infoOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setInfoOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [infoOpen])

  return (
    <div className="border-luxe surface-luxe relative overflow-hidden rounded-[1.75rem] p-6 shadow-xl shadow-primary/10 sm:p-8">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-[color-mix(in_oklab,var(--emerald)_16%,transparent)] blur-3xl" />

      {/* header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[color-mix(in_oklab,var(--primary)_30%,transparent)] to-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-[var(--primary)] ring-1 ring-[color-mix(in_oklab,var(--primary)_30%,transparent)]">
            <span className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 rounded-full bg-[color-mix(in_oklab,var(--primary)_35%,transparent)] blur-md" />
            <Gauge className="gauge-needle relative h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-semibold tracking-tight">Daily Limit</h3>
              {/* info dialog trigger */}
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                aria-label="How the daily limit resets"
                aria-haspopup="dialog"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Resets every 24 hours</p>
          </div>
        </div>

        {/* tier / quota badge */}
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
            hasAccess
              ? 'bg-[color-mix(in_oklab,var(--primary)_16%,transparent)] text-[var(--primary)] ring-1 ring-[color-mix(in_oklab,var(--primary)_32%,transparent)]'
              : 'border border-border/60 bg-input/20 text-muted-foreground',
          )}
        >
          {isUnlimited ? (
            <>
              <InfinityIcon className="h-3.5 w-3.5" />
              Unlimited
            </>
          ) : hasAccess ? (
            <>
              <RefreshCw className="h-3 w-3" />
              {limit} / tool
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              {TIER_LABEL[tier]}
            </>
          )}
        </span>
      </div>

      {/* body */}
      {loading ? (
        <ul className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="h-[104px] animate-pulse rounded-2xl border border-border/60 bg-input/20"
            />
          ))}
        </ul>
      ) : !hasAccess ? (
        /* Free tier: fully locked, no counts */
        <div className="relative mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)] p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Locked on the Free plan</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              You can browse every page, but generating results is locked. Upgrade
              to unlock a daily quota across all four tools.
            </p>
          </div>
        </div>
      ) : (
        <ul className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <UsageTile
              key={feature}
              feature={feature}
              used={usage[feature] || 0}
              limit={limit}
              unlimited={isUnlimited}
            />
          ))}
        </ul>
      )}

      {/* Reset-time info dialog */}
      {mounted &&
        infoOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-info-title"
          >
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setInfoOpen(false)}
              className="animate-in fade-in absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm duration-200"
            />
            <div className="animate-in fade-in zoom-in-95 border-luxe surface-luxe relative z-10 w-full max-w-sm overflow-hidden rounded-3xl p-6 text-center shadow-2xl shadow-primary/25 duration-200">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Clock className="h-7 w-7" />
              </span>
              <h2
                id="reset-info-title"
                className="mt-4 text-lg font-bold tracking-tight"
              >
                Resets daily at 6:00 AM
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                Your daily quota refreshes every morning after 6:00 AM Bangladesh
                Standard Time (UTC+06:00).
              </p>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="btn-luxe mt-6 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground"
              >
                OK
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function UsageTile({
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
  const color = FEATURE_COLOR[feature]
  const remaining =
    unlimited || limit === null ? null : Math.max(0, limit - used)
  // Progress fills from low (0 used) to high (limit used)
  const pct =
    unlimited || limit === null || limit === 0
      ? 0
      : Math.min(100, Math.round((used / limit) * 100))
  const depleted = remaining !== null && remaining <= 0

  return (
    <li
      className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 p-4 transition-colors hover:border-[color:color-mix(in_oklab,var(--primary)_45%,transparent)]"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${color} 14%, transparent) 0%, color-mix(in oklab, ${color} 4%, transparent) 45%, transparent 100%)`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${color} 20%, transparent)`,
            color,
          }}
        >
          <Icon className="h-[1.1rem] w-[1.1rem]" />
        </span>
        {unlimited ? (
          <span
            className="flex items-center gap-1 font-mono text-sm font-bold"
            style={{ color }}
          >
            <InfinityIcon className="h-4 w-4" />
          </span>
        ) : (
          <span
            className={cn(
              'shrink-0 font-mono text-sm font-bold tabular-nums',
              depleted && 'text-down',
            )}
            style={depleted ? undefined : { color }}
          >
            {used}
            <span className="text-muted-foreground">/{limit}</span>
          </span>
        )}
      </div>

      <p className="truncate text-sm font-medium leading-tight">
        {FEATURE_LABEL[feature]}
      </p>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: depleted
              ? 'var(--down)'
              : `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), ${color})`,
          }}
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        {unlimited
          ? 'Unlimited generations'
          : depleted
            ? 'Daily limit reached'
            : `${remaining} left today`}
      </p>
    </li>
  )
}
