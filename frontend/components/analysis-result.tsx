'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PairFlags } from '@/components/pair-flags'
import {
  GlyphSurgeUp,
  GlyphSurgeDown,
  GlyphHold,
  GlyphTrend,
  GlyphCandles,
  GlyphLayers,
  GlyphStructure,
  GlyphWave,
  GlyphGauge,
  GlyphCore,
} from '@/components/result-glyphs'

export type AnalysisResult = {
  validation: { isValidChart: boolean; isOtc: boolean; reason: string }
  description: {
    pair: string
    timeframe: string
    trend: string
    marketStructure?: string
    candlesRead?: string
    candlePattern: string
    indicatorsRead?: string
    notes: string
  }
  analysis: {
    strategyVotes?: string
    votesTally?: string
    probabilityScores?: string
    signal: 'UP' | 'DOWN' | 'NO TRADE' | 'N/A'
    option: 'CALL' | 'PUT' | 'NO TRADE' | 'N/A'
    confidence: number
    support: string
    resistance: string
    keyFocus: string
    logic: string
  }
}

type Tone = 'up' | 'down' | 'flat'

function biasOf(text: string): Tone {
  const t = text.toUpperCase()
  if (/\b(UP|BULL|BULLISH|CALL|HIGHER)\b/.test(t)) return 'up'
  if (/\b(DOWN|BEAR|BEARISH|PUT|LOWER)\b/.test(t)) return 'down'
  return 'flat'
}

export function AnalysisResultCard({ result }: { result: AnalysisResult }) {
  const { description, analysis } = result
  const tone: Tone =
    analysis.signal === 'UP' ? 'up' : analysis.signal === 'DOWN' ? 'down' : 'flat'
  const confidence = Math.max(0, Math.min(100, analysis.confidence || 0))
  const [detailsOpen, setDetailsOpen] = useState(false)

  const [base, quote] = (description.pair || '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .split('/')
    .map((p) => p?.trim().toUpperCase())
  const hasFlags = Boolean(base && quote)

  const hasDetails = Boolean(
    description.marketStructure ||
      description.indicatorsRead ||
      analysis.probabilityScores ||
      analysis.logic,
  )

  return (
    <div className="ar" data-tone={tone} data-testid="analysis-result">
      <div className="ar-card">
        <span className="ar-card-glow" aria-hidden />

        <header className="ar-rise ar-head" style={{ '--d': '0ms' } as React.CSSProperties}>
          <div className="flex min-w-0 items-center gap-3">
            {hasFlags ? (
              <span className="ar-flags">
                <PairFlags base={base} quote={quote} size={28} />
              </span>
            ) : (
              <span className="ar-flags ar-flags-empty">
                <GlyphCandles className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="ar-pair" data-testid="result-pair">
                {description.pair || 'Chart'}
              </p>
              <p className="ar-sub">
                <span className="ar-live-dot" aria-hidden />
                Live read · {description.timeframe || '1 Min'}
              </p>
            </div>
          </div>
        </header>

        <SignalHero tone={tone} option={analysis.option} />

        <div className="ar-duo">
          <ConfidenceRing tone={tone} value={confidence} />
          <PriceLadder support={analysis.support} resistance={analysis.resistance} />
        </div>

        <div className="ar-chips">
          <ReadChip
            icon={<GlyphTrend className="h-5 w-5" />}
            label="Trend"
            value={description.trend}
            tone={biasOf(description.trend || '')}
            delay={520}
            testId="result-trend"
          />
          <ReadChip
            icon={<GlyphCandles className="h-5 w-5" />}
            label="Pattern"
            value={description.candlePattern}
            tone="flat"
            delay={580}
            testId="result-pattern"
          />
        </div>

        {hasDetails && (
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="ar-rise ar-cta"
            style={{ '--d': '640ms' } as React.CSSProperties}
            aria-haspopup="dialog"
            data-testid="analysis-details-btn"
          >
            <span className="ar-cta-icon">
              <GlyphLayers className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-semibold">Analysis details</span>
              <span className="ar-cta-sub">Structure · Indicators · Scores · Reasoning</span>
            </span>
            <span className="ar-cta-open">
              Open
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <path d="M5 11 11 5M6.5 5H11v4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {detailsOpen && (
        <AnalysisDetailsPopup
          tone={tone}
          marketStructure={description.marketStructure}
          indicators={description.indicatorsRead}
          scores={analysis.probabilityScores}
          reasoning={analysis.logic}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  )
}

function SignalHero({ tone, option }: { tone: Tone; option: string }) {
  const isFlat = tone === 'flat'
  const label = isFlat ? 'NO TRADE' : option
  const caption = isFlat
    ? 'Strategies conflict — stand aside and wait for a cleaner setup.'
    : tone === 'up'
      ? 'Upward move expected · enter on the next candle'
      : 'Downward move expected · enter on the next candle'

  return (
    <section
      className="ar-rise ar-hero"
      style={{ '--d': '90ms' } as React.CSSProperties}
      data-testid="signal-hero"
    >
      <div className="ar-medal" aria-hidden>
        <span className="ar-medal-ring" />
        <span className="ar-medal-dash" />
        <span className="ar-medal-core" />
        <span className="ar-medal-glyph">
          {isFlat ? <GlyphHold /> : tone === 'up' ? <GlyphSurgeUp /> : <GlyphSurgeDown />}
        </span>
      </div>

      <div className="relative min-w-0 flex-1">
        <p className="ar-kicker">
          <span className="ar-kicker-bar" aria-hidden />
          {isFlat ? 'Stand aside' : 'Place option'}
        </p>
        <p className="ar-value" data-testid="result-option">
          {label}
        </p>
        <p className="ar-caption">{caption}</p>
      </div>

      {!isFlat && (
        <div className="ar-bars" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      )}
    </section>
  )
}

function ConfidenceRing({ tone, value }: { tone: Tone; value: number }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 160)
    return () => clearTimeout(t)
  }, [value])

  const r = 44
  const c = 2 * Math.PI * r
  const label = value >= 75 ? 'High conviction' : value >= 50 ? 'Moderate' : 'Low conviction'
  const gradId = `ar-ring-${tone}`

  return (
    <div
      className="ar-rise ar-tile ar-conf"
      style={{ '--d': '260ms' } as React.CSSProperties}
      data-testid="confidence-tile"
    >
      <p className="ar-tile-label">Confidence</p>
      <div className="ar-ring">
        <svg viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ar-tone-soft)" />
              <stop offset="100%" stopColor="var(--ar-tone)" />
            </linearGradient>
          </defs>
          <circle className="ar-ring-track" cx="50" cy="50" r={r} />
          <circle
            className="ar-ring-ticks"
            cx="50"
            cy="50"
            r={r - 8}
          />
          <circle
            className="ar-ring-fill"
            cx="50"
            cy="50"
            r={r}
            stroke={`url(#${gradId})`}
            strokeDasharray={c}
            strokeDashoffset={c - (c * shown) / 100}
          />
        </svg>
        <div className="ar-ring-center">
          <span className="ar-ring-num" data-testid="result-confidence">
            {value}
            <small>%</small>
          </span>
        </div>
      </div>
      <div className="ar-conf-text">
        <p className="ar-conf-label">{label}</p>
        <p className="ar-conf-note">Trade threshold 75%</p>
      </div>
    </div>
  )
}

function PriceLadder({ support, resistance }: { support: string; resistance: string }) {
  return (
    <div
      className="ar-rise ar-tile ar-ladder"
      style={{ '--d': '340ms' } as React.CSSProperties}
      data-testid="levels-tile"
    >
      <p className="ar-tile-label">Key levels</p>
      <div className="ar-ladder-body">
        <div className="ar-rail" aria-hidden>
          <span className="ar-rail-tick ar-rail-tick-top" />
          <span className="ar-rail-marker" />
          <span className="ar-rail-tick ar-rail-tick-bot" />
        </div>
        <div className="ar-ladder-vals">
          <div className="ar-level ar-level-res">
            <span className="ar-level-tag">Resistance</span>
            <span className="ar-level-val" data-testid="result-resistance">
              {resistance || '—'}
            </span>
          </div>
          <span className="ar-level-mid">price zone</span>
          <div className="ar-level ar-level-sup">
            <span className="ar-level-tag">Support</span>
            <span className="ar-level-val" data-testid="result-support">
              {support || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReadChip({
  icon,
  label,
  value,
  tone,
  delay,
  testId,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: Tone
  delay: number
  testId: string
}) {
  return (
    <div
      className="ar-rise ar-chip"
      data-chip-tone={tone}
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      <span className="ar-chip-icon">{icon}</span>
      <span className="min-w-0">
        <span className="ar-tile-label">{label}</span>
        <span className="ar-chip-val" data-testid={testId}>
          {value || '—'}
        </span>
      </span>
    </div>
  )
}

/* ── Details popup ──────────────────────────────────────────────────── */

function AnalysisDetailsPopup({
  tone,
  marketStructure,
  indicators,
  scores,
  reasoning,
  onClose,
}: {
  tone: Tone
  marketStructure?: string
  indicators?: string
  scores?: string
  reasoning?: string
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-details-title"
      className="ar ar-modal-root"
      data-tone={tone}
      data-testid="analysis-details-modal"
    >
      <button
        type="button"
        className="ar-modal-backdrop"
        onClick={onClose}
        aria-label="Close analysis details"
      />
      <div className="ar-modal">
        <div className="ar-modal-head">
          <span className="ar-modal-glyph">
            <GlyphLayers className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ar-tile-label">Full breakdown</p>
            <h2 id="analysis-details-title" className="ar-modal-title">
              Analysis details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ar-modal-close"
            aria-label="Close analysis details"
            data-testid="analysis-details-close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="ar-modal-body">
          {marketStructure && (
            <DetailSection icon={<GlyphStructure className="h-4.5 w-4.5" />} title="Market structure">
              <p className="ar-prose">{marketStructure}</p>
            </DetailSection>
          )}
          <IndicatorsSection raw={indicators} />
          <ScoresSection raw={scores} />
          {reasoning && (
            <DetailSection icon={<GlyphCore className="h-4.5 w-4.5" />} title="AI reasoning">
              <p className="ar-prose">{reasoning}</p>
            </DetailSection>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="ar-sec">
      <p className="ar-sec-title">
        <span className="ar-sec-icon">{icon}</span>
        {title}
      </p>
      {children}
    </section>
  )
}

function ScoresSection({ raw }: { raw?: string }) {
  const text = (raw || '').trim()
  if (!text) return null

  const rows = text
    .split(',')
    .map((s) => s.trim().match(/^(.+?):\s*(\d{1,3})\s*%?$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ name: m[1].trim(), value: Math.max(0, Math.min(100, Number(m[2]))) }))
    .filter((p) => !/^total$/i.test(p.name))

  if (rows.length === 0) return null

  return (
    <DetailSection icon={<GlyphGauge className="h-4.5 w-4.5" />} title="Probability scores">
      <ul className="ar-scores">
        {rows.map((p, i) => (
          <li key={i} className="ar-score" data-score-tone={p.value >= 75 ? 'up' : p.value >= 50 ? 'mid' : 'low'}>
            <span className="ar-score-name">{p.name}</span>
            <span className="ar-score-bar">
              <span style={{ width: `${p.value}%` }} />
            </span>
            <span className="ar-score-val">{p.value}%</span>
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}

function IndicatorsSection({ raw }: { raw?: string }) {
  const text = (raw || '').trim()
  if (!text) return null

  const isNone = /^none\b/i.test(text)
  const items = isNone
    ? []
    : text
        .split(/,(?![^()]*\))/)
        .map((s) => s.trim())
        .filter(Boolean)

  return (
    <DetailSection icon={<GlyphWave className="h-4.5 w-4.5" />} title="Technical indicators">
      {items.length === 0 ? (
        <p className="ar-prose ar-prose-dim">
          No indicators on this chart — signal is based on pure price action.
        </p>
      ) : (
        <ul className="ar-inds">
          {items.map((item, i) => {
            const bias = biasOf(item)
            return (
              <li key={i} className="ar-ind" data-ind-tone={bias}>
                <span className="ar-ind-text">
                  {item.replace(/\s*->\s*(UP|DOWN|NEUTRAL)\b/i, '')}
                </span>
                <span className="ar-ind-badge">
                  {bias === 'flat' ? 'NEUTRAL' : bias.toUpperCase()}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </DetailSection>
  )
}
