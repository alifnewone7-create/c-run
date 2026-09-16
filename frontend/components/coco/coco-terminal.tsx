'use client'

import { useEffect, useState } from 'react'
import { SatelliteDish, ArrowUpRight, ArrowDownRight, EyeOff } from 'lucide-react'
import { otcMarkets, realMarkets, marketLabel } from '@/lib/markets'

type Signal = {
  id: number
  t: string
  pair: string
  dir: 'CALL' | 'PUT'
  conf: number
  tf: string
}

const CRYPTO_OTC = [
  'Bitcoin',
  'Ethereum',
  'Litecoin',
  'Ripple',
  'Solana',
  'Polkadot',
  'Chainlink',
  'Toncoin',
  'Zcash',
  'Avalanche',
  'Binance Coin',
  'Dash',
  'Trump',
  'Cosmos',
  'Bitcoin Cash',
  'Ethereum Classic',
  'Axie Infinity',
]

const COMMODITY_OTC = ['Gold', 'Silver', 'USCrude', 'UKBrent']

const MARKETS: string[] = [
  ...otcMarkets.map(marketLabel),
  ...realMarkets.map(marketLabel),
  ...[...CRYPTO_OTC, ...COMMODITY_OTC].map((n) => `${n} (OTC)`),
]

const POOL: Omit<Signal, 'id' | 't'>[] = MARKETS.map((pair, i) => ({
  pair,
  dir: i % 2 === 0 ? 'CALL' : 'PUT',
  conf: 86 + ((i * 7) % 12),
  tf: i % 4 === 0 ? '5M' : '1M',
}))

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const INITIAL: Signal[] = POOL.slice(0, 5).map((s, i) => ({ ...s, id: i, t: '--:--' }))

const METRICS = [
  { k: 'median latency', v: '180ms' },
  { k: 'models in use', v: '4' },
  { k: 'pairs on watch', v: String(MARKETS.length) },
]

export function CocoTerminal() {
  const [rows, setRows] = useState<Signal[]>(INITIAL)

  useEffect(() => {
    const base = new Date()
    base.setSeconds(0, 0)
    // Top row is the upcoming minute, released ~35s before the candle opens.
    setRows((prev) =>
      prev.map((r, i) => ({ ...r, t: hhmm(new Date(base.getTime() + (1 - i) * 60000)) })),
    )

    let n = 5
    let interval: ReturnType<typeof setInterval>
    const push = () => {
      const target = new Date()
      target.setSeconds(0, 0)
      target.setMinutes(target.getMinutes() + 2)
      setRows((prev) => {
        const next = POOL[n % POOL.length]
        n += 1
        return [{ ...next, id: n, t: hhmm(target) }, ...prev].slice(0, 5)
      })
    }

    const now = new Date()
    const secs = now.getSeconds()
    const delay = ((secs < 35 ? 35 - secs : 95 - secs) * 1000) - now.getMilliseconds()
    const timeout = setTimeout(() => {
      push()
      interval = setInterval(push, 60000)
    }, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <section id="terminal" className="coco-dark scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center">
          <span className="coco-eyebrow">
            <SatelliteDish className="h-3 w-3" />
            Live feed preview
          </span>
          <h2 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[24ch] text-balance text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem]">
            Signals land in your console the second confluence forms.
          </h2>
          <p className="mx-auto mt-4 max-w-[54ch] text-pretty text-sm leading-relaxed text-white/62 sm:text-base">
            Four proprietary models vote on every candle. Only when they agree does a verdict ship,
            complete with direction, confidence and timeframe.
          </p>
          <div className="mt-9 grid w-full max-w-[620px] grid-cols-3 gap-3 sm:gap-4">
            {METRICS.map((m) => (
              <div key={m.k} className="coco-metric">
                <p className="coco-display text-[1.6rem] leading-none text-white sm:text-[2rem]">{m.v}</p>
                <p className="coco-mono mt-2 text-[10px] uppercase tracking-[0.1em] text-white/45">{m.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="coco-window mx-auto mt-12 max-w-[720px] text-left" data-testid="signal-terminal">
          <div className="coco-window-bar">
            <span className="coco-dot bg-[#ff5f57]" />
            <span className="coco-dot bg-[#febc2e]" />
            <span className="coco-dot bg-[#28c840]" />
            <span className="coco-mono ml-2 text-[10px] uppercase tracking-[0.12em] text-white/40">
              coco-signals · live
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <span className="coco-pulse h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              <span className="coco-mono text-[10px] uppercase text-[#4ade80]">streaming</span>
            </span>
          </div>
          <div className="coco-window-body flex flex-col gap-2">
            <div className="coco-mono coco-sig-head px-3 pb-1 text-[9px] uppercase tracking-[0.1em] text-white/35 sm:text-[10px]">
              <span>time</span>
              <span>pair</span>
              <span className="coco-conf-head">conf</span>
              <span>direction</span>
            </div>
            {rows.map((r, i) => (
              <div key={r.id} className="coco-sig-row" data-fresh={i === 0} data-testid="signal-row">
                <span className="text-white/45">{r.t}</span>
                <span className="truncate font-medium text-white">
                  {r.pair} <span className="text-white/35">· {r.tf}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="coco-conf">
                    <i style={{ width: `${r.conf}%` }} />
                  </span>
                  <span className="w-8 text-right text-white/70">{r.conf}%</span>
                </span>
                <a
                  href="#pricing"
                  aria-label="Unlock signal direction"
                  className="relative inline-flex items-center justify-center transition-transform hover:scale-105"
                  data-testid="signal-direction-lock"
                >
                  <span
                    aria-hidden="true"
                    className="coco-badge coco-badge-locked select-none blur-[4px]"
                  >
                    {r.dir === 'CALL' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {r.dir}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-white/90">
                    <EyeOff className="h-3.5 w-3.5" />
                  </span>
                </a>
              </div>
            ))}
            <a
              href="#pricing"
              className="coco-btn coco-btn-primary mt-1 w-full justify-center"
              data-testid="terminal-unlock-cta"
            >
              <EyeOff className="h-4 w-4" />
              Unlock live direction
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
