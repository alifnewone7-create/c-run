'use client'

import { Activity } from 'lucide-react'

const W = 800
const H = 300
const PAD = 8

// Deterministic values (no randomness) to avoid hydration mismatches.
const values = [
  210, 196, 204, 178, 188, 158, 172, 150, 162, 128, 142, 118, 132, 104, 120,
  96, 112, 84, 104, 72, 92, 66, 80, 58,
]

const min = Math.min(...values)
const max = Math.max(...values)
const stepX = (W - PAD * 2) / (values.length - 1)

const coords = values.map((v, i) => {
  const x = PAD + i * stepX
  const y = PAD + ((v - min) / (max - min)) * (H - PAD * 2)
  return { x, y }
})

const linePath = coords
  .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
  .join(' ')

const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H} L ${coords[0].x.toFixed(1)} ${H} Z`

const last = coords[coords.length - 1]

// Volume bars along the bottom
const bars = Array.from({ length: 40 }, (_, i) => i)

export function LiveChart() {
  return (
    <div className="border-luxe surface-luxe card-corner-glow relative flex flex-col overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="btn-luxe flex h-10 w-10 items-center justify-center rounded-xl">
            <Activity className="icon-pulse-soft h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Live Market Feed
            </h2>
            <p className="text-sm text-muted-foreground">
              AI momentum overlay · 1M timeframe
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-input/30 px-3 py-1.5 text-xs font-semibold">
          <span
            className="pulse-dot inline-block h-2 w-2 rounded-full"
            style={{ background: 'var(--up)' }}
          />
          Live
        </span>
      </div>

      <div className="relative z-10 mt-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full sm:h-64"
          preserveAspectRatio="none"
          role="img"
          aria-label="Live market chart"
        >
          <defs>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#area-fill)" />

          {/* Base line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#line-stroke)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated dashed overlay for a subtle live-drawing feel */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="10 990"
            className="dash-flow"
            opacity={0.9}
          />

          {/* Scan sweep */}
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            fill="url(#sweep)"
            className="scan-sweep"
          />

          {/* Current price marker */}
          <circle
            cx={last.x}
            cy={last.y}
            r={5}
            fill="var(--up)"
            className="pulse-dot"
          />
        </svg>

        {/* Volume equalizer bars */}
        <div className="mt-3 flex h-10 items-end gap-1">
          {bars.map((b) => (
            <span
              key={b}
              className="eq-bar flex-1 rounded-sm bg-primary/40"
              style={{
                height: `${30 + ((b * 37) % 70)}%`,
                animationDuration: `${2.4 + (b % 5) * 0.4}s`,
                animationDelay: `${(b % 8) * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
