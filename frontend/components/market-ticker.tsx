'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Pair = {
  symbol: string
  price: number
  change: number
}

const initialPairs: Pair[] = [
  { symbol: 'EUR/USD', price: 1.0842, change: 0.12 },
  { symbol: 'GBP/JPY', price: 198.34, change: -0.28 },
  { symbol: 'BTC/USD', price: 67432, change: 1.84 },
  { symbol: 'XAU/USD', price: 2338.5, change: 0.44 },
  { symbol: 'USD/JPY', price: 156.72, change: -0.19 },
  { symbol: 'ETH/USD', price: 3521.8, change: 2.31 },
  { symbol: 'AUD/USD', price: 0.6634, change: -0.07 },
  { symbol: 'USD/CAD', price: 1.3688, change: 0.09 },
]

function formatPrice(p: number) {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (p >= 100) return p.toFixed(2)
  return p.toFixed(4)
}

export function MarketTicker() {
  const [pairs, setPairs] = useState<Pair[]>(initialPairs)

  useEffect(() => {
    // Minimal, slow updates for a subtle "live" feel
    const id = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * 0.02
          const nextPrice = p.price * (1 + drift / 100)
          const nextChange = +(p.change + drift).toFixed(2)
          return { ...p, price: nextPrice, change: nextChange }
        }),
      )
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const row = [...pairs, ...pairs]

  return (
    <div className="border-luxe surface-luxe relative overflow-hidden rounded-2xl">
      <div className="flex w-max marquee-track">
        {row.map((p, i) => {
          const up = p.change >= 0
          return (
            <div
              key={`${p.symbol}-${i}`}
              className="flex items-center gap-2.5 border-r border-border/50 px-5 py-2.5"
            >
              <span className="text-sm font-semibold tracking-tight">
                {p.symbol}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {formatPrice(p.price)}
              </span>
              <span
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: up ? 'var(--up)' : 'var(--down)' }}
              >
                {up ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {up ? '+' : ''}
                {p.change.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
