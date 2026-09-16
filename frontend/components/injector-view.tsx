'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Radio,
  Landmark,
  Search,
  Clock,
  Timer,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Cpu,
  Check,
  Syringe,
  RefreshCw,
  Hourglass,
  Sparkles,
} from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { PairFlags } from '@/components/pair-flags'
import { AnalyzeFlow } from '@/components/analyze-flow'
import { InjectorChart } from '@/components/injector-chart'
import { otcMarkets, realMarkets, marketLabel, type Market, type MarketType } from '@/lib/markets'
import { cn } from '@/lib/utils'
import { useGatedAction } from '@/hooks/use-gated-action'

type Step = 'market' | 'duration' | 'analyzing' | 'result'
type Duration = 2 | 5 | 10
type Direction = 'UP' | 'DOWN'

type Injection = {
  market: Market
  duration: Duration
  direction: Direction
  entry: Date
  seed: number
}

const DURATIONS: { value: Duration; tag: string; note: string }[] = [
  { value: 2, tag: 'Quick strike', note: 'Tight window, fast read' },
  { value: 5, tag: 'Balanced', note: 'Room for the move to form' },
  { value: 10, tag: 'Extended', note: 'Structure-led, slower burn' },
]

const ANALYZING_MS = 10_000

function analysisLines(duration: number) {
  return [
    'Locking market feed',
    `Sampling ${duration}-minute structure`,
    'Mapping momentum clusters',
    'Injecting directional bias',
    'Sealing entry window',
  ]
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Same rule as Live Signals: <30s into the minute => next minute, else skip one.
function computeEntry(now = new Date()): Date {
  const entry = new Date(now)
  entry.setSeconds(0, 0)
  entry.setMinutes(entry.getMinutes() + (now.getSeconds() < 30 ? 1 : 2))
  return entry
}

export function InjectorView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell testid="injector-page" width="max-w-3xl">
          <InjectorStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function InjectorStudio() {
  const { preflight, handleServerGate } = useGatedAction('injector')
  const [step, setStep] = useState<Step>('market')
  const [tab, setTab] = useState<MarketType>('otc')
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState<Market | null>(null)
  const [duration, setDuration] = useState<Duration | null>(null)
  const [result, setResult] = useState<Injection | null>(null)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)

  const markets = tab === 'otc' ? otcMarkets : realMarkets
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    return q ? markets.filter((m) => `${m.base}/${m.quote}`.includes(q)) : markets
  }, [markets, query])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function scrollTop() {
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function pickMarket(m: Market) {
    setMarket(m)
    setDuration(null)
    setResult(null)
    setStep('duration')
    scrollTop()
  }

  function reset() {
    setMarket(null)
    setDuration(null)
    setResult(null)
    setStep('market')
    scrollTop()
  }

  async function inject() {
    if (!market || !duration || busy) return
    setBusy(true)
    try {
      const gate = await preflight()
      if (!gate.allowed) return

      const res = await fetch('/api/signals/injector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gate.token}` },
        body: JSON.stringify({ duration }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        handleServerGate(res.status, body)
        return
      }
      const data = (await res.json()) as { direction: Direction }

      setStep('analyzing')
      scrollTop()
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const entry = computeEntry()
        setResult({
          market,
          duration,
          direction: data.direction,
          entry,
          seed: (entry.getTime() / 60000) ^ market.id.length * 7919 ^ duration * 104729,
        })
        setStep('result')
      }, ANALYZING_MS)
    } catch {
      /* network failure: stay on the duration step */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={topRef} className="inj flex flex-1 scroll-mt-24 flex-col gap-4 sm:gap-5" data-testid="injector-studio">
      <StepRail step={step} />

      {step === 'market' && (
        <MarketStep tab={tab} onTab={setTab} query={query} onQuery={setQuery} markets={filtered} onPick={pickMarket} />
      )}

      {step === 'duration' && market && (
        <DurationStep
          market={market}
          duration={duration}
          onDuration={setDuration}
          onBack={reset}
          onInject={inject}
          busy={busy}
        />
      )}

      {step === 'analyzing' && market && duration && <AnalyzingStage market={market} duration={duration} />}

      {step === 'result' && result && <ResultCard result={result} onReset={reset} />}
    </div>
  )
}

/* ── Step rail ─────────────────────────────────────────────────────── */

const STEPS: { key: Step[]; label: string }[] = [
  { key: ['market'], label: 'Market' },
  { key: ['duration'], label: 'Duration' },
  { key: ['analyzing', 'result'], label: 'Inject' },
]

function StepRail({ step }: { step: Step }) {
  const activeIdx = STEPS.findIndex((s) => s.key.includes(step))
  return (
    <ol className="inj-rail coco-rise" data-testid="injector-step-rail">
      {STEPS.map((s, i) => {
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'idle'
        return (
          <li key={s.label} className="inj-rail-item" data-state={state}>
            <span className="inj-rail-num">{state === 'done' ? <Check className="h-3 w-3" /> : `0${i + 1}`}</span>
            <span className="inj-rail-label">{s.label}</span>
            {i < STEPS.length - 1 && <span className="inj-rail-line" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

/* ── Step 1: market ─────────────────────────────────────────────────── */

function MarketStep({
  tab,
  onTab,
  query,
  onQuery,
  markets,
  onPick,
}: {
  tab: MarketType
  onTab: (t: MarketType) => void
  query: string
  onQuery: (q: string) => void
  markets: Market[]
  onPick: (m: Market) => void
}) {
  return (
    <section className="inj-panel coco-rise" style={{ '--d': '80ms' } as React.CSSProperties} data-testid="injector-market-step">
      <div className="inj-seg" data-active={tab}>
        <span className="inj-seg-thumb" aria-hidden="true" />
        <button type="button" className="inj-seg-item" data-active={tab === 'otc'} onClick={() => onTab('otc')} data-testid="injector-tab-otc">
          <Radio className="h-4 w-4" />
          OTC Market
        </button>
        <button type="button" className="inj-seg-item" data-active={tab === 'real'} onClick={() => onTab('real')} data-testid="injector-tab-real">
          <Landmark className="h-4 w-4" />
          Real Market
        </button>
      </div>

      <label className="inj-search">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search pair (e.g. EUR/USD)"
          data-testid="injector-search"
        />
      </label>

      <div className="inj-grid-wrap">
        <div className="inj-grid scroll-rail" data-testid="injector-market-grid">
          {markets.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              className="inj-tile"
              style={{ '--d': `${Math.min(i, 24) * 30}ms` } as React.CSSProperties}
              data-testid={`injector-market-${m.type}-${m.base}${m.quote}`}
            >
              <PairFlags base={m.base} quote={m.quote} size={22} className="inj-tile-flags" />
              <span className="inj-tile-label">{marketLabel(m)}</span>
            </button>
          ))}
          {markets.length === 0 && <p className="inj-empty">No markets match “{query}”.</p>}
        </div>
      </div>
    </section>
  )
}

/* ── Step 2: duration ──────────────────────────────────────────────── */

function MarketHeader({ market, suffix, onBack }: { market: Market; suffix?: string; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <PairFlags base={market.base} quote={market.quote} size={30} />
        <div>
          <p className="coco-sub text-[17px] leading-tight text-white sm:text-lg" data-testid="injector-selected-market">
            {marketLabel(market)}
          </p>
          <p className="inj-kicker">
            {market.type === 'otc' ? 'OTC Market' : 'Real Market'}
            {suffix ? ` · ${suffix}` : ''}
          </p>
        </div>
      </div>
      {onBack && (
        <button type="button" onClick={onBack} className="inj-btn-ghost" data-testid="injector-change-market">
          <ChevronLeft className="h-3.5 w-3.5" />
          Change
        </button>
      )}
    </div>
  )
}

function DurationStep({
  market,
  duration,
  onDuration,
  onBack,
  onInject,
  busy,
}: {
  market: Market
  duration: Duration | null
  onDuration: (d: Duration) => void
  onBack: () => void
  onInject: () => void
  busy: boolean
}) {
  return (
    <section className="inj-panel coco-rise" style={{ '--d': '80ms' } as React.CSSProperties} data-testid="injector-duration-step">
      <MarketHeader market={market} onBack={onBack} />

      <div className="inj-divider" />

      <div className="flex items-center justify-between gap-3">
        <p className="inj-kicker inj-kicker-soft">Select duration</p>
        <span className="inj-chip">
          <Hourglass className="h-3 w-3" />
          Expiry window
        </span>
      </div>

      <div className="inj-dur-grid" role="radiogroup" aria-label="Select duration">
        {DURATIONS.map((d, i) => {
          const on = duration === d.value
          return (
            <button
              key={d.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onDuration(d.value)}
              className="inj-dur"
              data-on={on}
              style={{ '--d': `${120 + i * 70}ms` } as React.CSSProperties}
              data-testid={`injector-duration-${d.value}`}
            >
              <span className="inj-dur-check" aria-hidden="true">
                <Check className="h-3 w-3" />
              </span>
              <span className="inj-dur-num coco-display">
                {d.value}
                <small>min</small>
              </span>
              <span className="inj-dur-tag">{d.tag}</span>
              <span className="inj-dur-note">{d.note}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onInject}
        disabled={!duration || busy}
        className="inj-btn"
        data-testid="injector-inject-button"
      >
        <span className="inj-btn-sheen" aria-hidden="true" />
        <Syringe className="h-[18px] w-[18px]" />
        {busy ? 'Preparing…' : duration ? `Inject ${duration}-minute signal` : 'Select a duration to inject'}
      </button>
    </section>
  )
}

/* ── Step 3: analyzing ─────────────────────────────────────────────── */

function AnalyzingStage({ market, duration }: { market: Market; duration: Duration }) {
  const lines = useMemo(() => analysisLines(duration), [duration])
  const [line, setLine] = useState(0)

  useEffect(() => {
    setLine(0)
    const step = ANALYZING_MS / (lines.length + 1)
    const timers = lines.map((_, i) => setTimeout(() => setLine(i + 1), step * (i + 1)))
    return () => timers.forEach(clearTimeout)
  }, [lines])

  return (
    <section className="inj-panel coco-rise" style={{ '--d': '40ms' } as React.CSSProperties} data-testid="injector-analyzing">
      <MarketHeader market={market} suffix={`${duration} min`} />
      <div className="inj-divider" />

      <div className="inj-stage">
        <AnalyzeFlow stage={line} />

        <div className="inj-stage-line" data-testid="injector-analyzing-line">
          <Cpu className="h-3.5 w-3.5" />
          <span className="animate-pulse">{lines[Math.min(line, lines.length - 1)]}…</span>
        </div>

        <div className="flex items-center gap-1.5">
          {lines.map((_, i) => (
            <span key={i} className="inj-dot" data-on={i < line} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Step 4: result ────────────────────────────────────────────────── */

function ResultCard({ result, onReset }: { result: Injection; onReset: () => void }) {
  const { market, duration, direction, entry, seed } = result
  const up = direction === 'UP'
  const expiry = new Date(entry.getTime() + duration * 60_000)

  return (
    <div className="flex flex-col gap-4" data-testid="injector-result">
      <div className="inj-ready coco-rise">
        <Sparkles className="h-3.5 w-3.5" />
        Signal injected
      </div>

      <section
        className="inj-panel inj-result coco-rise"
        data-tone={up ? 'up' : 'down'}
        style={{ '--d': '60ms' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-3">
          <MarketHeader market={market} suffix="Injector" />
          <span className="inj-dir-pill" data-testid="injector-direction-pill">
            {up ? <ArrowUp className="h-4 w-4" strokeWidth={2.75} /> : <ArrowDown className="h-4 w-4" strokeWidth={2.75} />}
            {direction}
          </span>
        </div>

        <div className="inj-chart">
          <div className="inj-chart-head">
            <span className="inj-kicker inj-kicker-soft">Projected path · {duration} min</span>
            <span className="inj-chart-legend">
              <i /> projection
            </span>
          </div>
          <InjectorChart
            seed={seed}
            duration={duration}
            direction={direction}
            entryLabel={`Entry ${formatTime(entry)}`}
            expiryLabel={`Expiry ${formatTime(expiry)}`}
          />
        </div>

        <div className="inj-hero">
          <span className="inj-hero-badge">
            {up ? <ArrowUp className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2.75} /> : <ArrowDown className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2.75} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="inj-hero-label">Direction</p>
            <p className="inj-hero-value coco-display" data-testid="injector-direction">
              {direction}
            </p>
          </div>
          <div className="inj-eq" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>

        <div className="inj-stats">
          <div className="inj-stat">
            <span className="inj-stat-icon">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="inj-stat-label">Entry time</p>
              <p className="inj-stat-value coco-mono" data-testid="injector-entry-time">
                {formatTime(entry)}
              </p>
            </div>
          </div>
          <div className="inj-stat">
            <span className="inj-stat-icon">
              <Timer className="h-4 w-4" />
            </span>
            <div>
              <p className="inj-stat-label">Duration</p>
              <p className="inj-stat-value coco-mono" data-testid="injector-duration">
                {duration} Min
              </p>
            </div>
          </div>
          <div className="inj-stat inj-stat-wide">
            <span className="inj-stat-icon">
              <Hourglass className="h-4 w-4" />
            </span>
            <div>
              <p className="inj-stat-label">Expiry</p>
              <p className="inj-stat-value coco-mono" data-testid="injector-expiry-time">
                {formatTime(expiry)}
              </p>
            </div>
          </div>
        </div>

        <p className="inj-note" data-testid="injector-note">
          Enter {up ? 'UP' : 'DOWN'} at {formatTime(entry)} with a {duration}-minute expiry · closes {formatTime(expiry)}
        </p>
      </section>

      <button type="button" onClick={onReset} className={cn('inj-btn coco-rise')} style={{ '--d': '160ms' } as React.CSSProperties} data-testid="injector-reset-button">
        <span className="inj-btn-sheen" aria-hidden="true" />
        <RefreshCw className="h-4 w-4" />
        Inject New Signal
      </button>
    </div>
  )
}
