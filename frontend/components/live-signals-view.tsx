'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Radio,
  Landmark,
  Search,
  Clock,
  Timer,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RadioTower,
  Repeat,
  ShieldCheck,
  Cpu,
  Info,
  RefreshCw,
} from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { PairFlags } from '@/components/pair-flags'
import { Button } from '@/components/ui/button'
import { otcMarkets, realMarkets, marketLabel, type Market, type MarketType } from '@/lib/markets'
import { cn } from '@/lib/utils'
import { useGatedAction } from '@/hooks/use-gated-action'

type Step = 'select' | 'config' | 'analyzing' | 'result'

type LiveSignal = {
  market: Market
  entry: Date
  direction: 'UP' | 'DOWN'
}

// Figure-8 / infinity (lemniscate) path in a 200x100 viewBox.
const INFINITY_PATH =
  'M 100 50 C 128 14, 188 14, 188 50 C 188 86, 128 86, 100 50 C 72 14, 12 14, 12 50 C 12 86, 72 86, 100 50 Z'

const ANALYSIS_LINES = [
  'Linking neural core',
  'Streaming live candles',
  'Reading market pressure',
  'Running reverse-logic scan',
  'Locking entry window',
]

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Entry time rule:
 *  - If generated in the first half of the minute (< 30s), entry = next minute.
 *  - If generated at 30s or later, skip one minute (entry = minute + 2)
 *    so there is always enough lead time to place the trade.
 */
function computeLiveEntry(now = new Date()): Date {
  const entry = new Date(now)
  entry.setSeconds(0, 0)
  entry.setMinutes(entry.getMinutes() + (now.getSeconds() < 30 ? 1 : 2))
  return entry
}

export function LiveSignalsView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell
          testid="live-signals-page"
          eyebrow="Live signals"
          icon={RadioTower}
          title="One pair. One verdict. Live."
          desc="Pick a market and the engine reads the running tape, then hands you a single 1-minute call with the exact entry window."
          width="max-w-3xl"
        >
          <LiveSignalStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function LiveSignalStudio() {
  const { preflight, handleServerGate } = useGatedAction('live-signals')
  const [step, setStep] = useState<Step>('select')
  const [activeTab, setActiveTab] = useState<MarketType>('otc')
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState<Market | null>(null)
  const [signal, setSignal] = useState<LiveSignal | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)

  const markets = activeTab === 'otc' ? otcMarkets : realMarkets
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return markets
    return markets.filter((m) => `${m.base}/${m.quote}`.includes(q))
  }, [markets, query])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function scrollTop() {
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function pickMarket(m: Market) {
    setMarket(m)
    setSignal(null)
    setStep('config')
    scrollTop()
  }

  function backToSelect() {
    setMarket(null)
    setSignal(null)
    setStep('select')
    scrollTop()
  }

  async function generate() {
    if (!market) return

    // Client preflight (access + remaining credits). Server still enforces.
    const gate = await preflight()
    if (!gate.allowed) return

    // Consume a credit + fetch the direction from the server.
    let direction: 'UP' | 'DOWN'
    try {
      const res = await fetch('/api/signals/live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gate.token}`,
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (handleServerGate(res.status, body)) return
        return
      }
      const data = (await res.json()) as { direction: 'UP' | 'DOWN' }
      direction = data.direction
    } catch {
      return
    }

    setSignal(null)
    setStep('analyzing')
    scrollTop()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSignal({
        market,
        entry: computeLiveEntry(),
        direction,
      })
      setStep('result')
    }, 10_000)
  }

  return (
    <div ref={topRef} className="flex flex-1 scroll-mt-20 flex-col gap-6">
      {step === 'select' && (
        <MarketPicker
          activeTab={activeTab}
          onTab={setActiveTab}
          query={query}
          onQuery={setQuery}
          filtered={filtered}
          onPick={pickMarket}
        />
      )}

      {step !== 'select' && market && (
        <ConfigPanel
          market={market}
          step={step}
          signal={signal}
          onBack={backToSelect}
          onGenerate={generate}
        />
      )}
    </div>
  )
}

function MarketPicker({
  activeTab,
  onTab,
  query,
  onQuery,
  filtered,
  onPick,
}: {
  activeTab: MarketType
  onTab: (t: MarketType) => void
  query: string
  onQuery: (q: string) => void
  filtered: Market[]
  onPick: (m: Market) => void
}) {
  return (
    <section className="border-luxe surface-luxe relative flex flex-1 flex-col overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="flex flex-1 flex-col gap-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-input/20 p-1">
          <TabButton
            active={activeTab === 'otc'}
            onClick={() => onTab('otc')}
            icon={Radio}
            label="OTC Market"
          />
          <TabButton
            active={activeTab === 'real'}
            onClick={() => onTab('real')}
            icon={Landmark}
            label="Real Market"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search pair (e.g. EUR/USD)"
            className="h-11 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
          />
        </div>

        {/* Markets grouped inside a rounded rectangle container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/60 bg-input/10 p-2.5 sm:p-3">
          <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto pr-1 scroll-rail sm:grid-cols-4 lg:grid-cols-5">
            {filtered.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(m)}
                style={{ animationDelay: `${Math.min(i, 24) * 35}ms` }}
                className="market-tile group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border/50 p-2 text-center hover:border-accent/50"
              >
                <span className="tile-flags flex items-center justify-center">
                  <PairFlags base={m.base} quote={m.quote} size={20} />
                </span>
                <span className="tile-label w-full truncate text-xs font-semibold tracking-tight">
                  {marketLabel(m)}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No markets match “{query}”.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ConfigPanel({
  market,
  step,
  signal,
  onBack,
  onGenerate,
}: {
  market: Market
  step: Step
  signal: LiveSignal | null
  onBack: () => void
  onGenerate: () => void
}) {
  const analyzing = step === 'analyzing'

  // Once a signal is ready, show ONLY the result card — the generate/config
  // card is no longer rendered.
  if (step === 'result' && signal) {
    return <ResultBlock signal={signal} onBack={onBack} />
  }

  return (
    <section className="border-luxe surface-luxe card-corner-glow relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="relative z-10 flex flex-col gap-5">
        {/* Selected market header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PairFlags base={market.base} quote={market.quote} size={30} />
            <div>
              <p className="text-lg font-bold tracking-tight">{marketLabel(market)}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                {market.type === 'otc' ? 'OTC Market' : 'Real Market'}
              </p>
            </div>
          </div>
          {!analyzing && (
            <button
              type="button"
              onClick={onBack}
              className="btn-luxe-outline flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Change
            </button>
          )}
        </div>

        {/* Rules */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <RuleCard icon={Timer} label="Duration" value="1 Minute" />
          <RuleCard icon={Repeat} label="Money Management" value="1 Step MTG Must" />
        </div>

        {/* Analyzing / Generate */}
        {analyzing ? (
          <AnalysisStage />
        ) : (
          <Button
            onClick={onGenerate}
            className="btn-luxe h-14 w-full gap-2 rounded-2xl py-3.5 text-base font-bold"
          >
            <RadioTower className="icon-float h-5 w-5" />
            Generate Live Signal
          </Button>
        )}
      </div>
    </section>
  )
}

function RuleCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-input/20 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        <Icon className="h-4 w-4 text-accent" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function AnalysisStage() {
  const [line, setLine] = useState(0)

  useEffect(() => {
    setLine(0)
    const step = 10_000 / (ANALYSIS_LINES.length + 1)
    const timers = ANALYSIS_LINES.map((_, i) =>
      setTimeout(() => setLine(i + 1), step * (i + 1)),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="inf-surface flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-accent/20 py-10">
      <div className="inf-stage">
        <span className="inf-core" />
        <svg className="inf-svg" viewBox="0 0 200 100" role="img" aria-label="Analyzing">
          <defs>
            <linearGradient id="inf-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
            <radialGradient id="inf-comet" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path className="inf-track" d={INFINITY_PATH} />
          <path className="inf-glow" d={INFINITY_PATH} />
          <path className="inf-flow" d={INFINITY_PATH} />
          <path className="inf-flow inf-flow-2" d={INFINITY_PATH} />
          {/* comet travelling along the infinity path */}
          <circle className="inf-comet" r="5" fill="url(#inf-comet)">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={INFINITY_PATH} rotate="auto" />
          </circle>
          <circle className="inf-comet inf-comet-2" r="4" fill="url(#inf-comet)">
            <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite" path={INFINITY_PATH} rotate="auto" />
          </circle>
          <circle className="inf-node" cx="100" cy="50" r="3" />
        </svg>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-accent sm:text-sm">
        <Cpu className="h-3.5 w-3.5" />
        <span className="animate-pulse">
          {ANALYSIS_LINES[Math.min(line, ANALYSIS_LINES.length - 1)]}…
        </span>
      </div>

      {/* progress dots */}
      <div className="flex items-center gap-1.5">
        {ANALYSIS_LINES.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i < line ? 'w-6 bg-accent' : 'w-1.5 bg-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function ResultBlock({
  signal,
  onBack,
}: {
  signal: LiveSignal
  onBack: () => void
}) {
  const { market, entry, direction } = signal
  const isUp = direction === 'UP'
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-4 duration-500">
      <div className="flex items-center gap-2">
        <ShieldCheck className="shield-beat h-4 w-4 text-up" />
        <h3 className="font-mono text-sm font-bold text-up">Live signal ready</h3>
      </div>

      <div className="border-luxe surface-luxe card-corner-glow animate-in fade-in slide-in-from-bottom-3 relative overflow-hidden rounded-2xl p-5 duration-500">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PairFlags base={market.base} quote={market.quote} size={30} />
              <div>
                <p className="text-lg font-bold tracking-tight">{marketLabel(market)}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {market.type === 'otc' ? 'OTC Market' : 'Real Market'} · Live
                </p>
              </div>
            </div>
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold',
                isUp ? 'bg-up/15 text-up' : 'bg-down/15 text-down',
              )}
            >
              {isUp ? (
                <ChevronsUp className="dir-arrow-up h-4 w-4" />
              ) : (
                <ChevronsDown className="dir-arrow-down h-4 w-4" />
              )}
              {direction}
            </span>
          </div>

          <div
            className={cn(
              'signal-card relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 sm:gap-5 sm:p-5',
              isUp ? 'signal-card-up text-up' : 'signal-card-down text-down',
            )}
          >
            {/* moving scan line across the top edge */}
            <span className="signal-card-scan" aria-hidden />
            {/* faint ticker grid backdrop */}
            <span className="signal-card-grid" aria-hidden />

            {/* left: directional badge */}
            <div
              className={cn(
                'signal-badge relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl sm:h-20 sm:w-20',
                isUp ? 'signal-badge-up' : 'signal-badge-down',
              )}
            >
              <span className="signal-badge-glow" aria-hidden />
              <span className="signal-badge-ring" aria-hidden />
              {isUp ? (
                <ArrowUp className="signal-badge-icon relative h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.75} />
              ) : (
                <ArrowDown className="signal-badge-icon relative h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.75} />
              )}
            </div>

            {/* middle: label */}
            <div className="relative flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Direction
              </span>
              <p className="font-mono text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
                {direction}
              </p>
            </div>

            {/* right: animated strength equalizer */}
            <div className="relative flex h-14 shrink-0 items-end gap-1 sm:h-16">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="signal-eq-bar"
                  style={{ animationDelay: `${i * 0.12}s` }}
                  aria-hidden
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 rounded-xl bg-input/25 px-3 py-2.5">
              <Clock className="clock-hands h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Entry time
                </p>
                <p className="font-mono text-sm font-bold tabular-nums">{formatTime(entry)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-input/25 px-3 py-2.5">
              <Timer className="icon-shake h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Duration
                </p>
                <p className="font-mono text-sm font-bold">1 Min</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-input/25 px-3 py-2.5">
            <Repeat className="repeat-swap h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Money Management
              </p>
              <p className="font-mono text-sm font-bold">1 Step MTG Must</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-[11px] text-accent">
            <Info className="info-pulse h-3.5 w-3.5 shrink-0" />
            Place the {isUp ? 'CALL' : 'PUT'} at {formatTime(entry)} · 1 Step MTG must if it loses
          </div>
        </div>
      </div>

      <Button
        onClick={onBack}
        className="btn-luxe h-12 w-full gap-2 rounded-2xl text-sm font-bold"
      >
        <RefreshCw className="refresh-spin h-4 w-4" />
        Generate New Signal
      </Button>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
        active ? 'btn-luxe' : 'text-muted-foreground hover:bg-input/40 hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4', active && 'text-primary-foreground')} />
      {label}
    </button>
  )
}
