'use client'

import { useState } from 'react'
import { ArrowRight, KeyRound } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import {
  FEATURES,
  FEATURE_LABEL,
  TIER_LABEL,
  QUOTA_RESET_NOTE,
  type FeatureKey,
} from '@/lib/tiers'
import {
  GlyphTier,
  GlyphQuota,
  GlyphOrbit,
  GlyphPulseLive,
  GlyphInjector,
  GlyphInfinite,
  GlyphVault,
  GlyphClockRing,
} from '@/components/dashboard/dash-glyphs'
import { GlyphOtcPrism, GlyphRealPulse } from '@/components/analyzer-glyphs'

type Glyph = ({ className }: { className?: string }) => JSX.Element

const FEATURE_GLYPH: Record<FeatureKey, Glyph> = {
  'otc-chart-analyzer': GlyphOtcPrism,
  'real-chart-analyzer': GlyphRealPulse,
  'future-signals': GlyphOrbit,
  'live-signals': GlyphPulseLive,
  injector: GlyphInjector,
}

const FEATURE_TONE: Record<FeatureKey, { light: string; dark: string }> = {
  'otc-chart-analyzer': { light: '#a688ff', dark: '#6d3bff' },
  'real-chart-analyzer': { light: '#6ddcae', dark: '#189a72' },
  'future-signals': { light: '#f3c775', dark: '#c2820f' },
  'live-signals': { light: '#8fb8ff', dark: '#3b62d8' },
  injector: { light: '#f0a3ff', dark: '#b13fd6' },
}

export function DashTier() {
  const { loading, tier, hasAccess, isUnlimited, limit, usage } = useAuth()
  const [noteOpen, setNoteOpen] = useState(false)

  return (
    <section
      id="tier"
      className="coco-light coco-curve-top scroll-mt-24"
      data-testid="dashboard-tier"
    >
      <div className="mx-auto max-w-[1140px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <span className="coco-eyebrow">
            <GlyphTier className="h-3.5 w-3.5" />
            Access tier
          </span>
          <h2 className="coco-display coco-title-gradient mx-auto mt-4 max-w-[24ch] text-balance text-[1.6rem] sm:text-[2.3rem] lg:text-[2.6rem]">
            Your licence and daily engine quota.
          </h2>
          <p className="coco-muted mx-auto mt-3 max-w-[54ch] text-pretty text-sm sm:text-[15px]">
            Every tool draws from its own daily allowance. Watch what is left, and upgrade the
            moment you need more room.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {/* Current tier card — flat strip above the quota panel */}
          <div
            className="coco-shade relative overflow-hidden rounded-[24px] p-5 sm:p-6"
            data-testid="tier-plan-card"
          >
            <span className="coco-d2-hero-line" aria-hidden="true" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="flex items-center gap-3.5">
                <span className="coco-d2-meta-icon h-12 w-12 flex-none rounded-[15px]">
                  <GlyphTier className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="coco-mono text-[9.5px] uppercase tracking-[0.16em] text-white/45">
                    Current plan
                  </p>
                  <p
                    className="coco-sub text-[21px] leading-tight text-white sm:text-[24px]"
                    data-testid="tier-plan-name"
                  >
                    {TIER_LABEL[tier]}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-white/10 lg:hidden" aria-hidden="true" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:flex-none">
                <button
                  type="button"
                  onClick={() => setNoteOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-left text-[12.5px] text-white/70 transition-colors hover:border-white/25 hover:text-white"
                  data-testid="tier-reset-toggle"
                >
                  <GlyphClockRing className="h-4 w-4 flex-none text-[#c4a6ff]" />
                  Resets daily at 6:00 AM (BST)
                </button>

                <a
                  href="https://t.me/Ayan_Dead"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="coco-btn coco-btn-primary w-full sm:w-auto"
                  data-testid="tier-upgrade-link"
                >
                  <KeyRound className="h-4 w-4" />
                  {hasAccess ? 'Upgrade licence' : 'Unlock access'}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            {noteOpen && (
              <p className="mt-3 text-[12px] leading-relaxed text-white/55">{QUOTA_RESET_NOTE}</p>
            )}
          </div>

          {/* Quota panel */}
          <div className="coco-d2-panel flex flex-col">
            <div className="flex items-start gap-3.5">
              <span className="coco-icon h-11 w-11 flex-none">
                <GlyphQuota className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="coco-sub text-[18px] sm:text-[20px]">Daily quota</h3>
                <p className="coco-muted mt-0.5 text-[13px]">
                  Live consumption across your five generation tools.
                </p>
              </div>
            </div>

            <div className="my-5 h-px w-full bg-gradient-to-r from-[#d8c9ff] via-[var(--hairline)] to-transparent" />

            {loading ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="h-[122px] animate-pulse rounded-[18px] border border-[var(--hairline)] bg-[#f4f4f8]"
                  />
                ))}
              </ul>
            ) : !hasAccess ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-[#d8c9ff] bg-[linear-gradient(180deg,#faf7ff,#ffffff)] p-8 text-center">
                <span className="coco-icon h-12 w-12">
                  <GlyphVault className="h-5 w-5" />
                </span>
                <p className="coco-sub text-[16px]">Locked on the Free plan</p>
                <p className="coco-muted mx-auto max-w-[40ch] text-[13px] leading-relaxed">
                  You can browse every page, but generating results stays locked. Upgrade to unlock a
                  daily quota across all five tools.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => (
                  <QuotaCard
                    key={feature}
                    feature={feature}
                    used={usage[feature] || 0}
                    limit={limit}
                    unlimited={isUnlimited}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function QuotaCard({
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
  const Glyph = FEATURE_GLYPH[feature]
  const tone = FEATURE_TONE[feature]
  const remaining = unlimited || limit === null ? null : Math.max(0, limit - used)
  const pct =
    unlimited || limit === null || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const depleted = remaining !== null && remaining <= 0

  return (
    <li className="coco-d2-quota">
      <div className="flex items-center justify-between gap-2">
        <span
          className="coco-d2-tool-icon h-10 w-10 rounded-[13px]"
          style={
            {
              '--t-light': tone.light,
              '--t-dark': tone.dark,
              '--t-shadow': `${tone.dark}55`,
            } as React.CSSProperties
          }
        >
          <Glyph className="h-[19px] w-[19px]" />
        </span>
        {unlimited ? (
          <span style={{ color: tone.dark }}>
            <GlyphInfinite className="h-5 w-5" />
          </span>
        ) : (
          <span className="font-mono text-[15px] font-bold tabular-nums">
            <span style={{ color: depleted ? '#d1435b' : tone.dark }}>{used}</span>
            <span className="text-[#9a9aa3]">/{limit}</span>
          </span>
        )}
      </div>

      <p className="mt-3 truncate text-[13.5px] font-semibold text-[var(--ink)]">
        {FEATURE_LABEL[feature]}
      </p>

      <div className="coco-d2-bar mt-2.5">
        <div
          className="coco-d2-bar-fill"
          style={{
            width: `${unlimited ? 100 : pct}%`,
            background: depleted
              ? 'linear-gradient(90deg,#f19aa6,#d1435b)'
              : `linear-gradient(90deg,${tone.light},${tone.dark})`,
          }}
        />
      </div>

      <p className="mt-2 text-[11.5px] text-[#77777f]">
        {unlimited
          ? 'Unlimited generations'
          : depleted
            ? 'Daily limit reached'
            : `${remaining} left today`}
      </p>
    </li>
  )
}
