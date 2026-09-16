'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Radio,
  Landmark,
  Check,
  X,
  Radar,
  ChevronsUp,
  ChevronsDown,
  Cpu,
  Clock,
  Timer,
  Layers,
  Search,
  ChevronRight,
  ChevronDown,
  Waypoints,
  Minus,
  Plus,
  Hash,
  Rocket,
} from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { PairFlags } from '@/components/pair-flags'
import { Button } from '@/components/ui/button'
import { otcMarkets, realMarkets, marketLabel, type Market, type MarketType } from '@/lib/markets'
import { cn } from '@/lib/utils'
import { useGatedAction } from '@/hooks/use-gated-action'

type Signal = {
  market: Market
  entry: Date
  direction: 'UP' | 'DOWN'
}

type Phase = 'idle' | 'scanning' | 'ready'

const TERMINAL_LINES = [
  '$ sweetex-ai --engine future-signals',
  '> booting neural core ....... OK',
  '> loading market feed ........ OK',
  '> syncing candle streams ..... OK',
  '> calibrating volatility model ',
  '> mapping support / resistance ',
  '> running reverse-logic scan ..',
  '> aggregating confidence layers',
  '> optimizing entry windows ....',
  '> finalizing future signals ...',
]

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function FutureSignalsView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell
          testid="future-signals-page"
          eyebrow="Future signals"
          icon={Rocket}
          title="Queue the next entries, ahead of time."
          desc="Select your pairs, choose how many calls you want, and the engine schedules each entry with its direction and exact minute."
          width="max-w-6xl"
        >
          <SignalStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function SignalStudio() {
  const { preflight, handleServerGate } = useGatedAction('future-signals')
  const [activeTab, setActiveTab] = useState<MarketType>('otc')
  const [selected, setSelected] = useState<Record<string, Market>>({})
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('idle')
  const [signals, setSignals] = useState<Signal[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const terminalRef = useRef<HTMLDivElement | null>(null)

  // The category currently locked by the selection (only one allowed at a time)
  const lockedType = useMemo<MarketType | null>(() => {
    const first = Object.values(selected)[0]
    return first ? first.type : null
  }, [selected])

  const selectedList = useMemo(() => Object.values(selected), [selected])

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

  function toggle(m: Market) {
    // Only allow markets from a single category at a time.
    if (lockedType && lockedType !== m.type) return
    setSelected((prev) => {
      const next = { ...prev }
      if (next[m.id]) delete next[m.id]
      else next[m.id] = m
      return next
    })
    if (phase !== 'idle') {
      setPhase('idle')
      setSignals([])
    }
  }

  function clearAll() {
    setSelected({})
    setSignals([])
    setPhase('idle')
  }

  async function generate() {
    if (selectedList.length === 0 || phase === 'scanning') return

    // Client preflight (access + remaining credits). Each generated signal
    // consumes one credit, so preflight against the full requested count.
    const gate = await preflight(count)
    if (!gate.allowed) return

    // Consume a credit + fetch the signal queue from the server. This cannot
    // be faked from the client without spending a real daily credit.
    let picks: { direction: 'UP' | 'DOWN'; offsetMin: number }[]
    try {
      const res = await fetch('/api/signals/future', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gate.token}`,
        },
        body: JSON.stringify({ count }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (handleServerGate(res.status, body)) return
        return
      }
      const data = (await res.json()) as {
        picks: { direction: 'UP' | 'DOWN'; offsetMin: number }[]
      }
      picks = data.picks
    } catch {
      return
    }

    setSignals([])
    setPhase('scanning')

    // Smoothly scroll the terminal into view so it's fully visible on any device.
    requestAnimationFrame(() => {
      terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    // Map the server-issued picks onto the selected markets with entry times.
    const base = Date.now()
    let cumulative = 0
    const queue: Signal[] = picks.map((pick, i) => {
      const m = selectedList[i % selectedList.length]
      cumulative += pick.offsetMin
      return {
        market: m,
        entry: new Date(base + cumulative * 60_000),
        direction: pick.direction,
      }
    })

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSignals(queue)
      setPhase('ready')
    }, 10_000)
  }

  const disabledOther = lockedType !== null

  return (
    <div className="flex flex-col gap-6">
      {/* Selected summary — only shown once markets are selected */}
      {selectedList.length > 0 && (
        <SelectedBar
          selectedList={selectedList}
          lockedType={lockedType}
          onRemove={(m) => toggle(m)}
          onClear={clearAll}
        />
      )}

      {/* Market picker */}
      <section className="border-luxe surface-luxe relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-bold tracking-tight">Select markets</h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-input/20 p-1">
              <TabButton
                active={activeTab === 'otc'}
                onClick={() => setActiveTab('otc')}
                icon={Radio}
                label="OTC Market"
                dim={disabledOther && lockedType !== 'otc'}
              />
              <TabButton
                active={activeTab === 'real'}
                onClick={() => setActiveTab('real')}
                icon={Landmark}
                label="Real Market"
                dim={disabledOther && lockedType !== 'real'}
              />
            </div>
          </div>

          {/* Lock hint */}
          {lockedType && (
            <p className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-xs text-accent">
              <Check className="h-3.5 w-3.5" />
              {lockedType === 'otc' ? 'OTC Market' : 'Real Market'} locked · clear selection to
              switch categories.
            </p>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pair (e.g. EUR/USD)"
              className="h-11 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
            />
          </div>

          {/* Grid */}
          <div className="grid max-h-[22rem] grid-cols-2 gap-2.5 overflow-y-auto pr-1 scroll-rail sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => {
              const isSelected = Boolean(selected[m.id])
              const isDisabled = disabledOther && lockedType !== m.type
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                    isSelected
                      ? 'border-transparent btn-luxe'
                      : 'border-border bg-input/20 hover:border-accent/40 hover:bg-input/40',
                    isDisabled && 'cursor-not-allowed opacity-35 hover:border-border hover:bg-input/20',
                  )}
                >
                  <PairFlags base={m.base} quote={m.quote} size={20} />
                  <span
                    className={cn(
                      'flex-1 truncate text-sm font-semibold',
                      isSelected && 'text-primary-foreground',
                    )}
                  >
                    {marketLabel(m)}
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      isSelected
                        ? 'border-primary-foreground/50 bg-primary-foreground/20'
                        : 'border-border bg-transparent group-hover:border-accent/50',
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No markets match “{query}”.
              </p>
            )}
          </div>

          {/* Signal count */}
          <SignalCount
            count={count}
            min={1}
            max={20}
            onChange={(n) => {
              setCount(n)
              if (phase !== 'idle') {
                setPhase('idle')
                setSignals([])
              }
            }}
          />

          {/* Generate */}
          <Button
            onClick={generate}
            disabled={selectedList.length === 0 || phase === 'scanning'}
            className="btn-luxe mt-1 h-14 w-full gap-2 rounded-2xl py-3.5 text-base font-bold disabled:opacity-50"
          >
            <Waypoints
              className={cn(
                'h-5 w-5',
                phase === 'scanning' ? 'animate-spin' : 'icon-float',
              )}
            />
            {phase === 'scanning'
              ? 'Generating…'
              : `Generate Future Signal${count > 1 ? 's' : ''}`}
            {selectedList.length > 0 && phase !== 'scanning' && (
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {count}
              </span>
            )}
          </Button>
        </div>
      </section>

      {/* Terminal + results */}
      {phase !== 'idle' && (
        <div ref={terminalRef} className="scroll-mt-20">
          <SignalTerminal phase={phase} signals={signals} />
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  dim,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  dim?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all',
        active
          ? 'btn-luxe'
          : 'text-muted-foreground hover:bg-input/40 hover:text-foreground',
        dim && !active && 'opacity-50',
      )}
    >
      <Icon className={cn('h-4 w-4', active && 'text-primary-foreground')} />
      {label}
    </button>
  )
}

function SignalCount({
  count,
  min,
  max,
  onChange,
}: {
  count: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const presets = [3, 5, 10, 15]

  return (
    <div className="flex flex-row items-center justify-between gap-3 rounded-2xl border border-border/60 bg-input/20 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <Hash className="h-4 w-4 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight">How many signals?</p>
          <p className="truncate text-xs text-muted-foreground">Choose the amount to generate</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* presets */}
        <div className="hidden items-center gap-1 rounded-xl border border-border/60 bg-background/40 p-1 sm:flex">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(clamp(p))}
              className={cn(
                'min-w-8 rounded-lg px-2 py-1 text-xs font-bold transition-all',
                count === p
                  ? 'btn-luxe'
                  : 'text-muted-foreground hover:bg-input/50 hover:text-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* stepper */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/40 p-1">
          <button
            type="button"
            onClick={() => onChange(clamp(count - 1))}
            disabled={count <= min}
            aria-label="Decrease signal count"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={count}
            onChange={(e) => {
              const v = Number.parseInt(e.target.value, 10)
              if (!Number.isNaN(v)) onChange(clamp(v))
            }}
            className="w-12 bg-transparent text-center font-mono text-lg font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Signal count"
          />
          <button
            type="button"
            onClick={() => onChange(clamp(count + 1))}
            disabled={count >= max}
            aria-label="Increase signal count"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectedBar({
  selectedList,
  lockedType,
  onRemove,
  onClear,
}: {
  selectedList: Market[]
  lockedType: MarketType | null
  onRemove: (m: Market) => void
  onClear: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const MOBILE_LIMIT = 3
  const isCollapsible = selectedList.length > MOBILE_LIMIT

  return (
    <section className="border-luxe surface-luxe rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="btn-luxe flex h-8 w-8 items-center justify-center rounded-lg">
            <Check className="h-4 w-4 text-primary-foreground" />
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold tracking-tight">Selected</h2>
            <span className="text-xs text-muted-foreground">
              {selectedList.length} market{selectedList.length === 1 ? '' : 's'}
              {lockedType ? ` · ${lockedType === 'otc' ? 'OTC Market' : 'Real Market'}` : ''}
            </span>
          </div>
        </div>
        {selectedList.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="btn-luxe-outline flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {selectedList.length === 0 ? (
          <p className="col-span-3 text-sm text-muted-foreground">
            No markets selected yet. Pick pairs below to build your signal queue.
          </p>
        ) : (
          selectedList.map((m, i) => {
            // On mobile, hide chips beyond the limit until expanded. Always show on sm+.
            const hiddenOnMobile = isCollapsible && !expanded && i >= MOBILE_LIMIT
            return (
              <span
                key={m.id}
                className={cn(
                  'animate-in fade-in zoom-in-95 min-w-0 items-center justify-center gap-1 rounded-full border border-border bg-input/30 px-1.5 py-1 text-[10px] font-semibold duration-200 sm:justify-start sm:gap-2 sm:pl-1.5 sm:pr-1 sm:text-sm',
                  hiddenOnMobile ? 'hidden sm:flex' : 'flex',
                )}
              >
                <span className="shrink-0">
                  <PairFlags base={m.base} quote={m.quote} size={14} />
                </span>
                <span className="truncate">{marketLabel(m)}</span>
                <button
                  type="button"
                  onClick={() => onRemove(m)}
                  aria-label={`Remove ${marketLabel(m)}`}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive sm:h-5 sm:w-5"
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </span>
            )
          })
        )}
      </div>

      {/* Mobile-only see all / show less toggle */}
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="btn-luxe-outline mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold sm:hidden"
        >
          {expanded ? 'Show less' : `Show all ${selectedList.length}`}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </section>
  )
}

function SignalTerminal({ phase, signals }: { phase: Phase; signals: Signal[] }) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const logEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (phase !== 'scanning') return
    setVisibleLines(0)
    const step = 10_000 / (TERMINAL_LINES.length + 1)
    const timers = TERMINAL_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), step * (i + 1)),
    )
    return () => timers.forEach(clearTimeout)
  }, [phase])

  // Follow the typed log as it grows: scroll just far enough to keep the
  // latest line in view, never past where the terminal text currently reaches.
  useEffect(() => {
    if (phase !== 'scanning') return
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [visibleLines, phase])

  return (
    <section className="border-luxe animate-in fade-in slide-in-from-bottom-3 overflow-hidden rounded-3xl bg-[oklch(0.13_0.03_280)] duration-500">
      {/* terminal top bar */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-[oklch(0.17_0.035_278)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-[var(--gold)]/70" />
        <span className="h-3 w-3 rounded-full bg-up/70" />
        <span className="ml-2 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-accent" />
          sweetex@ai — future-signals
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {phase === 'scanning' ? (
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Cube */}
            <div className="cube-scene flex h-32 w-32 items-center justify-center">
              <div
                className="cube"
                style={{ ['--cube-size' as string]: '96px', ['--cube-half' as string]: '48px' }}
              >
                {(['front', 'back', 'right', 'left', 'top', 'bottom'] as const).map((f) => (
                  <div key={f} className={`cube__face cube__face--${f}`}>
                    <Cpu strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </div>

            {/* typed log */}
            <div className="w-full max-w-md font-mono text-xs leading-relaxed sm:text-sm">
              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                <p
                  key={line}
                  className={cn(
                    'animate-in fade-in slide-in-from-left-1 duration-200',
                    i === 0 ? 'text-accent' : 'text-up',
                  )}
                >
                  {line}
                </p>
              ))}
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <span className="inline-block h-3.5 w-2 animate-pulse bg-accent" />
                <span className="text-accent">analyzing entry windows…</span>
              </p>
              <div ref={logEndRef} aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Radar className="icon-float h-4 w-4 text-accent" />
              <h3 className="font-mono text-sm font-bold text-up">
                {signals.length} future signal{signals.length === 1 ? '' : 's'} generated
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {signals.map((s, i) => (
                <SignalCard key={`${s.market.id}-${i}`} signal={s} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  const { market, entry, direction } = signal
  const isUp = direction === 'UP'
  return (
    <div
      className="border-luxe surface-luxe card-corner-glow animate-in fade-in slide-in-from-bottom-3 relative overflow-hidden rounded-2xl p-4 duration-500"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <PairFlags base={market.base} quote={market.quote} size={26} />
            <div>
              <p className="text-base font-bold tracking-tight">
                {marketLabel(market)}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                {market.type === 'otc' ? 'OTC Market' : 'Real Market'} · #{index + 1}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold',
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

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-input/25 px-3 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Entry time
              </p>
              <p className="font-mono text-sm font-bold tabular-nums">{formatTime(entry)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-input/25 px-3 py-2.5">
            <Timer className="h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Duration
              </p>
              <p className="font-mono text-sm font-bold">1 Min</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5 text-accent" />
          Place the {direction === 'UP' ? 'CALL' : 'PUT'} at {formatTime(entry)} · expiry 1 minute
        </div>
      </div>
    </div>
  )
}
