'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Timer, Check, Syringe, RefreshCw, Hourglass } from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { InjectorChart } from '@/components/injector-chart'
import {
  AnalyzingStage,
  DirTag,
  MarketGrid,
  MarketHeader,
  PrimaryButton,
  SearchBox,
  SegTabs,
  StatTile,
  VerdictPlate,
  computeLiveEntry,
  formatTime,
  useMarketFilter,
  type Direction,
} from '@/components/signal-kit'
import { otcMarkets, realMarkets, type Market, type MarketType } from '@/lib/markets'
import { useGatedAction } from '@/hooks/use-gated-action'

type Step = 'market' | 'duration' | 'analyzing' | 'result'
type Duration = 2 | 5 | 10

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

  const filtered = useMarketFilter(tab === 'otc' ? otcMarkets : realMarkets, query)
  const lines = useMemo(() => analysisLines(duration ?? 2), [duration])

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
        const entry = computeLiveEntry()
        setResult({
          market,
          duration,
          direction: data.direction,
          entry,
          seed: (entry.getTime() / 60000) ^ (market.id.length * 7919) ^ (duration * 104729),
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
      {step === 'market' && (
        <section className="inj-panel coco-rise" style={{ '--d': '80ms' } as React.CSSProperties} data-testid="injector-market-step">
          <SegTabs tab={tab} onTab={setTab} testidPrefix="injector" />
          <SearchBox value={query} onChange={setQuery} testid="injector-search" />
          <MarketGrid markets={filtered} query={query} onPick={pickMarket} testidPrefix="injector" />
        </section>
      )}

      {step === 'duration' && market && (
        <section className="inj-panel coco-rise" style={{ '--d': '80ms' } as React.CSSProperties} data-testid="injector-duration-step">
          <MarketHeader market={market} onBack={reset} backTestid="injector-change-market" nameTestid="injector-selected-market" />
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
                  onClick={() => setDuration(d.value)}
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
          <PrimaryButton onClick={inject} disabled={!duration || busy} icon={Syringe} testid="injector-inject-button">
            {busy ? 'Preparing…' : duration ? `Inject ${duration}-minute signal` : 'Select a duration to inject'}
          </PrimaryButton>
        </section>
      )}

      {step === 'analyzing' && market && duration && (
        <section className="inj-panel coco-rise" style={{ '--d': '40ms' } as React.CSSProperties}>
          <MarketHeader market={market} suffix={`${duration} min`} nameTestid="injector-selected-market" />
          <div className="inj-divider" />
          <AnalyzingStage lines={lines} durationMs={ANALYZING_MS} testid="injector-analyzing" />
        </section>
      )}

      {step === 'result' && result && <ResultCard result={result} onReset={reset} />}
    </div>
  )
}

function ResultCard({ result, onReset }: { result: Injection; onReset: () => void }) {
  const { market, duration, direction, entry, seed } = result
  const expiry = new Date(entry.getTime() + duration * 60_000)

  return (
    <div className="flex flex-col gap-4" data-testid="injector-result">
      <section className="inj-panel coco-rise" data-tone={direction === 'UP' ? 'up' : 'down'} style={{ '--d': '40ms' } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-3">
          <MarketHeader market={market} suffix="Injector" nameTestid="injector-selected-market" />
          <DirTag direction={direction} testid="injector-direction-pill" />
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

        <VerdictPlate direction={direction} testid="injector-verdict" />

        <div className="inj-stats">
          <StatTile icon={Clock} label="Entry time" value={formatTime(entry)} testid="injector-entry-time" />
          <StatTile icon={Timer} label="Duration" value={`${duration} Min`} testid="injector-duration" />
        </div>
      </section>

      <PrimaryButton onClick={onReset} icon={RefreshCw} testid="injector-reset-button" delay="140ms">
        Inject New Signal
      </PrimaryButton>
    </div>
  )
}
