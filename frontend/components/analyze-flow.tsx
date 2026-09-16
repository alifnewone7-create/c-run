'use client'

import Image from 'next/image'

/* Unique, premium glyphs drawn only for the analyzing flow diagram. */
const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function GlyphNeural({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 4.6 25.6 10v12L16 27.4 6.4 22V10L16 4.6Z" {...s} strokeWidth="1.6" opacity="0.45" />
      <path d="M11 12.4l5 3.6 5-3.6M16 16v6.4M11 12.4v7.2l5 2.8 5-2.8v-7.2" {...s} strokeWidth="1.5" opacity="0.4" />
      <circle cx="16" cy="9.6" r="2" fill="currentColor" />
      <circle cx="10.6" cy="20.2" r="1.7" fill="currentColor" />
      <circle cx="21.4" cy="20.2" r="1.7" fill="currentColor" />
    </svg>
  )
}

function GlyphCandleCaliper({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4.5 27h23" {...s} strokeWidth="1.5" opacity="0.4" />
      <path d="M10 8.4v15.2M21.6 5.6v18" {...s} strokeWidth="1.5" opacity="0.6" />
      <rect x="6.8" y="11.6" width="6.4" height="8.4" rx="1.6" {...s} strokeWidth="2.1" />
      <rect x="18.4" y="9" width="6.4" height="11" rx="1.6" fill="currentColor" opacity="0.9" />
      <path d="M4.6 5.6h4M4.6 5.6v3" {...s} strokeWidth="2" />
    </svg>
  )
}

function GlyphPressure({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M5 22a11 11 0 0 1 22 0" {...s} strokeWidth="1.9" opacity="0.45" />
      <path d="M5 22h3.2M23.8 22H27M8.4 13.4l2.3 2.3M23.6 13.4l-2.3 2.3M16 9.6v3.2" {...s} strokeWidth="1.6" opacity="0.5" />
      <path d="M16 22 23 14.4" {...s} strokeWidth="2.6" />
      <circle cx="16" cy="22" r="2.4" fill="currentColor" />
    </svg>
  )
}

function GlyphLevels({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4.5 9.4h23M4.5 16h14M4.5 22.6h23" {...s} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
      <path d="M7 9.4h9M7 22.6h11" {...s} strokeWidth="2.4" />
      <circle cx="23.4" cy="16" r="5" {...s} strokeWidth="1.8" opacity="0.6" />
      <circle cx="23.4" cy="16" r="1.9" fill="currentColor" />
    </svg>
  )
}

function GlyphMomentum({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M3.5 19c3.4 0 4.4-8 7.8-8s4.4 8 7.8 8 4.5-5.4 7.9-5.4" {...s} strokeWidth="2.3" />
      <path d="M3.5 25.4c3.4 0 5-3.4 8.4-3.4s5 3.4 8.4 3.4 5-2.4 8.2-2.4" {...s} strokeWidth="1.5" opacity="0.4" />
      <path d="M22.6 5.2l1.5 3.4 3.4 1.5-3.4 1.5-1.5 3.4-1.5-3.4-3.4-1.5 3.4-1.5 1.5-3.4Z" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function GlyphBiasLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="11.6" {...s} strokeWidth="1.5" opacity="0.38" strokeDasharray="4 4" />
      <path d="M11.6 14.4v-2.2a4.4 4.4 0 0 1 8.8 0v2.2" {...s} strokeWidth="2.1" />
      <rect x="9.6" y="14.4" width="12.8" height="9.2" rx="3" {...s} strokeWidth="2.1" />
      <path d="M16 17.6v2.8" {...s} strokeWidth="2.4" />
    </svg>
  )
}

type Tile = {
  key: string
  label: string
  icon: (p: { className?: string }) => React.JSX.Element
  bg: string
  ink: string
  ring: string
}

const TILES: Tile[] = [
  {
    key: 'neural',
    label: 'Neural core link',
    icon: GlyphNeural,
    bg: 'linear-gradient(145deg,#6d4bf5 0%,#2a1470 100%)',
    ink: '#ffffff',
    ring: '#8f6bff',
  },
  {
    key: 'candles',
    label: 'Candle structure',
    icon: GlyphCandleCaliper,
    bg: 'linear-gradient(145deg,#12433a 0%,#07211d 100%)',
    ink: '#4ee0a8',
    ring: '#31c78f',
  },
  {
    key: 'pressure',
    label: 'Trend & pressure',
    icon: GlyphPressure,
    bg: 'linear-gradient(145deg,#4a2a14 0%,#20100a 100%)',
    ink: '#ff9a4d',
    ring: '#ff7a45',
  },
  {
    key: 'levels',
    label: 'Key levels',
    icon: GlyphLevels,
    bg: 'linear-gradient(145deg,#123a52 0%,#071a28 100%)',
    ink: '#5ec8f7',
    ring: '#3aa5e0',
  },
  {
    key: 'momentum',
    label: 'Momentum wave',
    icon: GlyphMomentum,
    bg: 'linear-gradient(145deg,#3d1140 0%,#1a0620 100%)',
    ink: '#f06fd0',
    ring: '#d94fb5',
  },
  {
    key: 'bias',
    label: 'Bias lock',
    icon: GlyphBiasLock,
    bg: 'linear-gradient(145deg,#3a3520 0%,#18150a 100%)',
    ink: '#f2d675',
    ring: '#e0bd4a',
  },
]

type Placed = { x: number; y: number; s: number }
type Wire = { d: string; dot: [number, number] }

type Layout = {
  id: string
  w: number
  h: number
  core: { x: number; y: number; r: number }
  tiles: Record<string, Placed>
  wires: Record<string, Wire>
}

const DESKTOP: Layout = {
  id: 'ad',
  w: 520,
  h: 300,
  core: { x: 260, y: 150, r: 42 },
  tiles: {
    neural: { x: 72, y: 62, s: 54 },
    candles: { x: 206, y: 44, s: 46 },
    pressure: { x: 452, y: 62, s: 58 },
    levels: { x: 66, y: 238, s: 58 },
    momentum: { x: 300, y: 262, s: 46 },
    bias: { x: 460, y: 230, s: 64 },
  },
  wires: {
    neural: { d: 'M72 90 V126 H260 V150', dot: [72, 126] },
    candles: { d: 'M206 68 V108 H260 V150', dot: [206, 108] },
    pressure: { d: 'M452 92 V126 H260 V150', dot: [452, 126] },
    levels: { d: 'M66 208 V174 H260 V150', dot: [66, 174] },
    momentum: { d: 'M300 238 V196 H260 V150', dot: [300, 196] },
    bias: { d: 'M460 197 V174 H260 V150', dot: [460, 174] },
  },
}

const MOBILE: Layout = {
  id: 'am',
  w: 320,
  h: 380,
  core: { x: 160, y: 190, r: 34 },
  tiles: {
    neural: { x: 58, y: 56, s: 48 },
    candles: { x: 160, y: 42, s: 40 },
    pressure: { x: 262, y: 64, s: 50 },
    levels: { x: 50, y: 190, s: 52 },
    momentum: { x: 96, y: 334, s: 44 },
    bias: { x: 258, y: 316, s: 56 },
  },
  wires: {
    neural: { d: 'M58 82 V128 H160 V190', dot: [58, 128] },
    candles: { d: 'M160 64 V190', dot: [160, 112] },
    pressure: { d: 'M262 90 V128 H160 V190', dot: [262, 128] },
    levels: { d: 'M78 190 H160', dot: [112, 190] },
    momentum: { d: 'M96 312 V250 H160 V190', dot: [96, 250] },
    bias: { d: 'M258 288 V250 H160 V190', dot: [258, 250] },
  },
}

function pct(v: number, base: number) {
  return `${(v / base) * 100}%`
}

function state(index: number, stage: number) {
  if (index < stage) return 'done'
  if (index === stage) return 'active'
  return 'idle'
}

function Diagram({
  layout,
  stage,
  className,
}: {
  layout: Layout
  stage: number
  className?: string
}) {
  const { id, w, h, core, tiles, wires } = layout
  const glow = id === 'ad'
  return (
    <div className={`aflow ${className ?? ''}`} style={{ aspectRatio: `${w} / ${h}` }}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
      >
        <defs>
          <filter id={`aflowGlow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>
        {TILES.map((tile, i) => {
          const wire = wires[tile.key]
          const st = state(i, stage)
          return (
            <g key={tile.key} data-state={st}>
              <path
                d={wire.d}
                fill="none"
                stroke={st === 'idle' ? 'rgba(226,232,255,0.16)' : 'rgba(226,232,255,0.44)'}
                strokeWidth="1.3"
                vectorEffect="non-scaling-stroke"
                className="aflow-wire"
              />
              {st !== 'idle' && (
                <>
                  <path
                    className="aflow-pulse"
                    d={wire.d}
                    pathLength={100}
                    fill="none"
                    stroke={tile.ring}
                    strokeOpacity={glow ? 0.85 : 0.5}
                    strokeWidth={glow ? 7 : 5}
                    strokeLinecap="round"
                    strokeDasharray="14 686"
                    vectorEffect="non-scaling-stroke"
                    filter={glow ? `url(#aflowGlow-${id})` : undefined}
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                  <path
                    className="aflow-pulse"
                    d={wire.d}
                    pathLength={100}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeDasharray="14 686"
                    vectorEffect="non-scaling-stroke"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                </>
              )}
              <circle
                cx={wire.dot[0]}
                cy={wire.dot[1]}
                r="4.4"
                fill="#0b0715"
                stroke={st === 'idle' ? 'rgba(226,232,255,0.3)' : tile.ring}
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>

      {TILES.map((tile, i) => {
        const p = tiles[tile.key]
        const st = state(i, stage)
        return (
          <div
            key={tile.key}
            title={tile.label}
            className="aflow-tile"
            data-state={st}
            data-testid={`analyze-flow-tile-${tile.key}`}
            style={
              {
                left: pct(p.x - p.s / 2, w),
                top: pct(p.y - p.s / 2, h),
                width: pct(p.s, w),
                background: tile.bg,
                color: tile.ink,
                '--ring': tile.ring,
                '--d': `${120 + i * 110}ms`,
              } as React.CSSProperties
            }
          >
            <tile.icon className="aflow-tile-icon" />
          </div>
        )
      })}

      <div
        className="aflow-core"
        data-testid="analyze-flow-core"
        style={{
          left: pct(core.x - core.r, w),
          top: pct(core.y - core.r, h),
          width: pct(core.r * 2, w),
        }}
      >
        <span className="aflow-core-ring" aria-hidden="true" />
        <span className="aflow-core-sweep" aria-hidden="true" />
        <span className="aflow-core-img">
          <Image src="/coco-ai.jpg" alt="" fill sizes="120px" className="object-cover" />
        </span>
      </div>
    </div>
  )
}

export function AnalyzeFlow({ stage }: { stage: number }) {
  return (
    <div className="w-full" data-testid="analyze-flow">
      <Diagram layout={DESKTOP} stage={stage} className="mx-auto hidden w-full max-w-[430px] sm:block" />
      <Diagram layout={MOBILE} stage={stage} className="mx-auto w-full max-w-[236px] sm:hidden" />
    </div>
  )
}
