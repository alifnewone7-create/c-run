'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Timer, X, Minus, Plus, Hash, Waypoints, RefreshCw, Layers, ArrowUp, ArrowDown } from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { PairFlags } from '@/components/pair-flags'
import {
  AnalyzingStage,
  BrokerBar,
  BrokerLine,
  DirTag,
  MarketGrid,
  PrimaryButton,
  SearchBox,
  SegTabs,
  formatTime,
  useBroker,
  useMarketFilter,
  type Direction,
} from '@/components/signal-kit'
import { otcMarkets, realMarkets, marketLabel, type Market, type MarketType } from '@/lib/markets'
import type { Broker } from '@/lib/brokers'
import { useGatedAction } from '@/hooks/use-gated-action'

type Phase = 'build' | 'analyzing' | 'result'

type Signal = {
  market: Market
  entry: Date
  direction: Direction
}

const ANALYZING_MS = 10_000
const LINES = [
  'Booting neural core',
  'Syncing candle streams',
  'Calibrating volatility model',
  'Mapping support & resistance',
  'Optimizing entry windows',
]
const PRESETS = [3, 5, 10, 15]
const MIN = 1
const MAX = 20

export function FutureSignalsView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell testid="future-signals-page" width="max-w-3xl">
          <FutureStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function FutureStudio() {
  const { preflight, handleServerGate } = useGatedAction('future-signals')
  const [broker, setBroker] = useBroker()
  const [phase, setPhase] = useState<Phase>('build')
  const [tab, setTab] = useState<MarketType>('otc')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Record<string, Market>>({})
  const [count, setCount] = useState(5)
  const [signals, setSignals] = useState<Signal[]>([])
  const [busy, setBusy] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)

  const selectedList = useMemo(() => Object.values(selected), [selected])
  const lockedType = selectedList[0]?.type ?? null
  const filtered = useMarketFilter(tab === 'otc' ? otcMarkets : realMarkets, query)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function scrollTop() {
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function toggle(m: Market) {
    if (lockedType && lockedType !== m.type) return
    setSelected((prev) => {
      const next = { ...prev }
      if (next[m.id]) delete next[m.id]
      else next[m.id] = m
      return next
    })
  }

  function clearAll() {
    setSelected({})
  }

  function reset() {
    setSignals([])
    setPhase('build')
    scrollTop()
  }

  async function generate() {
    if (selectedList.length === 0 || busy) return
    setBusy(true)
    try {
      const gate = await preflight(count)
      if (!gate.allowed) return

      const res = await fetch('/api/signals/future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gate.token}` },
        body: JSON.stringify({ count }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        handleServerGate(res.status, body)
        return
      }
      const data = (await res.json()) as { picks: { direction: Direction; offsetMin: number }[] }

      const base = Date.now()
      let cumulative = 0
      const queue: Signal[] = data.picks.map((pick, i) => {
        cumulative += pick.offsetMin
        return {
          market: selectedList[i % selectedList.length],
          entry: new Date(base + cumulative * 60_000),
          direction: pick.direction,
        }
      })

      setPhase('analyzing')
      scrollTop()
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSignals(queue)
        setPhase('result')
      }, ANALYZING_MS)
    } catch {
      /* network failure: stay on build */
    } finally {
      setBusy(false)
    }
  }

  const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n))

  return (
    <div ref={topRef} className="inj flex flex-1 scroll-mt-24 flex-col gap-4 sm:gap-5" data-testid="future-studio">
      {phase !== 'result' && <BrokerBar broker={broker} onChange={setBroker} />}

      {phase === 'build' && (
        <section className="inj-panel coco-rise" style={{ '--d': '80ms' } as React.CSSProperties} data-testid="future-build-step">
          <SegTabs tab={tab} onTab={setTab} lockedTo={lockedType} testidPrefix="future" />
          <SearchBox value={query} onChange={setQuery} testid="future-search" />

          {lockedType && lockedType !== tab && (
            <p className="fs-lock" data-testid="future-lock-hint">
              {lockedType === 'otc' ? 'OTC Market' : 'Real Market'} is locked for this queue · clear the selection to switch.
            </p>
          )}

          <MarketGrid
            markets={filtered}
            query={query}
            onPick={toggle}
            isSelected={(m) => Boolean(selected[m.id])}
            isDisabled={(m) => Boolean(lockedType && lockedType !== m.type)}
            testidPrefix="future"
          />

          <SelectedRow list={selectedList} onRemove={toggle} onClear={clearAll} />

          <div className="fs-count" data-testid="future-count">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inj-stat-icon">
                <Hash className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">How many signals?</p>
                <p className="fs-count-sub">Each signal uses one daily credit</p>
              </div>
            </div>
            <div className="fs-count-controls">
              <div className="fs-presets">
                {PRESETS.map((p) => (
                  <button key={p} type="button" onClick={() => setCount(p)} className="fs-preset" data-on={count === p} data-testid={`future-preset-${p}`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="fs-stepper">
                <button type="button" onClick={() => setCount(clamp(count - 1))} disabled={count <= MIN} aria-label="Decrease signal count" data-testid="future-count-minus">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN}
                  max={MAX}
                  value={count}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10)
                    if (!Number.isNaN(v)) setCount(clamp(v))
                  }}
                  aria-label="Signal count"
                  data-testid="future-count-input"
                />
                <button type="button" onClick={() => setCount(clamp(count + 1))} disabled={count >= MAX} aria-label="Increase signal count" data-testid="future-count-plus">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <PrimaryButton onClick={generate} disabled={selectedList.length === 0 || busy} icon={Waypoints} testid="future-generate-button">
            {busy
              ? 'Preparing…'
              : selectedList.length === 0
                ? 'Select markets to build a queue'
                : `Generate ${count} Future Signal${count > 1 ? 's' : ''}`}
          </PrimaryButton>
        </section>
      )}

      {phase === 'analyzing' && (
        <section className="inj-panel coco-rise" style={{ '--d': '40ms' } as React.CSSProperties}>
          <QueueHeader list={selectedList} count={count} />
          <div className="inj-divider" />
          <AnalyzingStage lines={LINES} durationMs={ANALYZING_MS} testid="future-analyzing" />
        </section>
      )}

      {phase === 'result' && <FutureResults signals={signals} broker={broker} markets={selectedList} onReset={reset} />}
    </div>
  )
}

function QueueHeader({ list, count }: { list: Market[]; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inj-stat-icon">
        <Layers className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="coco-sub text-[17px] leading-tight text-white sm:text-lg">
          {count} signal{count > 1 ? 's' : ''} · {list.length} market{list.length > 1 ? 's' : ''}
        </p>
        <p className="inj-kicker">{list[0]?.type === 'otc' ? 'OTC Market' : 'Real Market'} · Future queue</p>
      </div>
      <div className="fs-flag-stack" aria-hidden="true">
        {list.slice(0, 4).map((m) => (
          <PairFlags key={m.id} base={m.base} quote={m.quote} size={18} />
        ))}
        {list.length > 4 && <span className="fs-flag-more">+{list.length - 4}</span>}
      </div>
    </div>
  )
}

function SelectedRow({ list, onRemove, onClear }: { list: Market[]; onRemove: (m: Market) => void; onClear: () => void }) {
  if (list.length === 0) {
    return (
      <p className="fs-selected-empty" data-testid="future-selected-empty">
        Tap pairs above to build your queue.
      </p>
    )
  }
  return (
    <div className="fs-selected" data-testid="future-selected">
      <div className="flex items-center justify-between gap-3">
        <p className="inj-kicker inj-kicker-soft">
          Selected · {list.length} market{list.length > 1 ? 's' : ''}
        </p>
        <button type="button" onClick={onClear} className="inj-btn-ghost" data-testid="future-clear-selected">
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
      <div className="fs-chips">
        {list.map((m) => (
          <span key={m.id} className="fs-chip" data-testid={`future-chip-${m.base}${m.quote}`}>
            <PairFlags base={m.base} quote={m.quote} size={14} />
            <span className="truncate">{marketLabel(m)}</span>
            <button type="button" onClick={() => onRemove(m)} aria-label={`Remove ${marketLabel(m)}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

function FutureResults({ signals, broker, markets, onReset }: { signals: Signal[]; broker: Broker; markets: Market[]; onReset: () => void }) {
  const ups = signals.filter((s) => s.direction === 'UP').length
  return (
    <div className="flex flex-col gap-4" data-testid="future-result">
      <section className="inj-panel coco-rise" style={{ '--d': '40ms' } as React.CSSProperties}>
        <QueueHeader list={markets} count={signals.length} />
        <div className="flex flex-wrap items-center gap-2.5">
          <BrokerLine broker={broker} testid="future-broker-line" />
          <span className="fs-mix" data-testid="future-mix">
            <i data-tone="up">
              <ArrowUp className="h-3 w-3" strokeWidth={3} />
              {ups}
            </i>
            <i data-tone="down">
              <ArrowDown className="h-3 w-3" strokeWidth={3} />
              {signals.length - ups}
            </i>
          </span>
        </div>
        <div className="inj-divider" />

        <ol className="fs-list">
          {signals.map((s, i) => (
            <li
              key={`${s.market.id}-${i}`}
              className="fs-card"
              data-tone={s.direction === 'UP' ? 'up' : 'down'}
              style={{ '--d': `${80 + i * 60}ms` } as React.CSSProperties}
              data-testid={`future-signal-${i}`}
            >
              <span className="fs-card-rail" aria-hidden="true" />
              <span className="fs-card-index coco-mono">{String(i + 1).padStart(2, '0')}</span>
              <div className="fs-card-main">
                <div className="flex items-center gap-2.5">
                  <PairFlags base={s.market.base} quote={s.market.quote} size={24} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-white">{marketLabel(s.market)}</p>
                    <p className="inj-kicker">{s.market.type === 'otc' ? 'OTC' : 'Real'} · {broker.name}</p>
                  </div>
                </div>
                <div className="fs-card-meta">
                  <span data-testid={`future-signal-${i}-entry`}>
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(s.entry)}
                  </span>
                  <span>
                    <Timer className="h-3.5 w-3.5" />1 Min
                  </span>
                </div>
              </div>
              <DirTag direction={s.direction} testid={`future-signal-${i}-direction`} size="sm" />
            </li>
          ))}
        </ol>
      </section>

      <PrimaryButton onClick={onReset} icon={RefreshCw} testid="future-reset-button" delay="140ms">
        Build New Queue
      </PrimaryButton>
    </div>
  )
}
