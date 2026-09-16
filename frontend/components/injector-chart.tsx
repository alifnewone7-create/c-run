'use client'

import { useMemo } from 'react'

type Candle = { o: number; h: number; l: number; c: number }

type Props = {
  seed: number
  duration: number
  direction: 'UP' | 'DOWN'
  entryLabel: string
  expiryLabel: string
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 360
const H = 168
const PAD_TOP = 14
const PAD_BOTTOM = 30
const PAD_X = 10

/* Historical 1-minute candles followed by a projected path that spans the
   chosen duration. Deterministic per seed so re-renders never re-draw it. */
export function InjectorChart({ seed, duration, direction, entryLabel, expiryLabel }: Props) {
  const model = useMemo(() => {
    const rnd = mulberry32(seed)
    const up = direction === 'UP'
    const history = 10 + duration
    const projSteps = duration * 2

    const candles: Candle[] = []
    let price = 100
    for (let i = 0; i < history; i++) {
      const lastThree = i >= history - 3
      const drift = lastThree ? (up ? 0.28 : -0.28) : (rnd() - 0.5) * 0.35
      const body = (rnd() - 0.5) * 1.4 + drift
      const o = price
      const c = o + body
      const h = Math.max(o, c) + rnd() * 0.55
      const l = Math.min(o, c) - rnd() * 0.55
      candles.push({ o, h, l, c })
      price = c
    }

    const proj: number[] = [price]
    const total = (2.4 + duration * 0.22) * (up ? 1 : -1)
    for (let i = 1; i <= projSteps; i++) {
      const t = i / projSteps
      const eased = 1 - Math.pow(1 - t, 2.2)
      proj.push(price + total * eased + (rnd() - 0.5) * 0.7 * (1 - t * 0.5))
    }

    const all = [
      ...candles.flatMap((c) => [c.h, c.l]),
      ...proj,
    ]
    const min = Math.min(...all) - 0.4
    const max = Math.max(...all) + 0.4

    const plotW = W - PAD_X * 2
    const histW = plotW * 0.6
    const projW = plotW - histW - 14
    const slot = histW / history
    const cw = Math.max(3.5, slot * 0.58)
    const y = (p: number) => PAD_TOP + ((max - p) / (max - min)) * (H - PAD_TOP - PAD_BOTTOM)
    const entryX = PAD_X + histW

    const projPts = proj.map((p, i) => [entryX + (projW * i) / projSteps, y(p)] as const)
    const projPath = projPts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
    const areaPath = `${projPath} L ${(entryX + projW).toFixed(1)} ${(H - PAD_BOTTOM).toFixed(1)} L ${entryX.toFixed(1)} ${(H - PAD_BOTTOM).toFixed(1)} Z`
    const last = projPts[projPts.length - 1]

    return { candles, slot, cw, y, entryX, projPath, areaPath, last, plotW, up }
  }, [seed, duration, direction])

  const tone = model.up ? 'var(--inj-up)' : 'var(--inj-down)'
  const gid = `inj-area-${seed}-${duration}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="inj-chart-svg"
      role="img"
      aria-label={`Projected ${direction} move over ${duration} minutes`}
      data-testid="injector-chart"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.34" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9b4ff" />
          <stop offset="100%" stopColor={tone} />
        </linearGradient>
      </defs>

      {/* grid */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => {
        const gy = PAD_TOP + t * (H - PAD_TOP - PAD_BOTTOM)
        return <line key={t} x1={PAD_X} x2={W - PAD_X} y1={gy} y2={gy} className="inj-chart-grid" />
      })}

      {/* projection zone */}
      <rect
        x={model.entryX}
        y={PAD_TOP - 6}
        width={PAD_X + model.plotW - model.entryX}
        height={H - PAD_TOP - PAD_BOTTOM + 12}
        className="inj-chart-zone"
      />

      {/* candles */}
      {model.candles.map((c, i) => {
        const cx = PAD_X + i * model.slot + model.slot / 2
        const bull = c.c >= c.o
        const top = model.y(Math.max(c.o, c.c))
        const bottom = model.y(Math.min(c.o, c.c))
        return (
          <g
            key={i}
            className="inj-candle"
            data-bull={bull}
            style={{ '--d': `${i * 45}ms` } as React.CSSProperties}
          >
            <line x1={cx} x2={cx} y1={model.y(c.h)} y2={model.y(c.l)} />
            <rect
              x={cx - model.cw / 2}
              y={top}
              width={model.cw}
              height={Math.max(1.4, bottom - top)}
              rx="1"
            />
          </g>
        )
      })}

      {/* entry marker */}
      <line
        x1={model.entryX}
        x2={model.entryX}
        y1={PAD_TOP - 6}
        y2={H - PAD_BOTTOM + 6}
        className="inj-chart-entry"
      />

      {/* projected path */}
      <path d={model.areaPath} fill={`url(#${gid})`} className="inj-chart-area" />
      <path
        d={model.projPath}
        fill="none"
        stroke={`url(#${gid}-line)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="inj-chart-path"
      />
      <circle cx={model.last[0]} cy={model.last[1]} r="4.5" fill={tone} className="inj-chart-tip" />
      <circle cx={model.last[0]} cy={model.last[1]} r="4.5" fill="none" stroke={tone} className="inj-chart-tip-ring" />

      {/* time axis */}
      <text x={model.entryX} y={H - 9} textAnchor="middle" className="inj-chart-label inj-chart-label-entry">
        {entryLabel}
      </text>
      <text x={W - PAD_X} y={H - 9} textAnchor="end" className="inj-chart-label">
        {expiryLabel}
      </text>
      <text x={PAD_X} y={H - 9} textAnchor="start" className="inj-chart-label inj-chart-label-dim">
        1m candles
      </text>
    </svg>
  )
}
