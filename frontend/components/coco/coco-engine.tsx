import Image from 'next/image'
import {
  GlyphOtc,
  GlyphReal,
  GlyphLive,
  GlyphFuture,
  GlyphNews,
  GlyphRisk,
  GlyphFeed,
} from '@/components/coco/coco-glyphs'

type Tile = {
  key: string
  label: string
  icon: (p: { className?: string }) => React.JSX.Element
  bg: string
  ink: string
}

type Placed = { x: number; y: number; s: number }
type Wire = { d: string; dot?: [number, number]; c: string }

type Layout = {
  id: string
  w: number
  h: number
  core: { x: number; y: number; r: number }
  tiles: Record<string, Placed>
  wires: Wire[]
}

const TILES: Tile[] = [
  { key: 'otc', label: 'OTC Analyzer', icon: GlyphOtc, bg: 'linear-gradient(145deg,#a06bff 0%,#6d3fe0 46%,#2f1173 100%)', ink: '#fff' },
  { key: 'real', label: 'Real Chart', icon: GlyphReal, bg: 'linear-gradient(145deg,#4a505f 0%,#262b36 48%,#12141b 100%)', ink: '#eef2fa' },
  { key: 'live', label: 'Live Signals', icon: GlyphLive, bg: 'linear-gradient(145deg,#6f63ff 0%,#4034d8 46%,#191264 100%)', ink: '#fff' },
  { key: 'future', label: 'Future Signals', icon: GlyphFuture, bg: 'linear-gradient(145deg,#5c4423 0%,#3a2612 48%,#160e06 100%)', ink: '#ff8c52' },
  { key: 'news', label: 'News Signals', icon: GlyphNews, bg: 'linear-gradient(145deg,#4a4838 0%,#2b2a20 48%,#141410 100%)', ink: '#f6f6ee' },
  { key: 'risk', label: 'Risk Guard', icon: GlyphRisk, bg: 'linear-gradient(145deg,#4f4da4 0%,#2f2e74 48%,#14133a 100%)', ink: '#cdb4ff' },
  { key: 'feed', label: 'Market Feed', icon: GlyphFeed, bg: 'linear-gradient(145deg,#f04fae 0%,#a91f7a 46%,#4a0c38 100%)', ink: '#fff' },
]

const DESKTOP: Layout = {
  id: 'd',
  w: 720,
  h: 400,
  core: { x: 360, y: 200, r: 54 },
  tiles: {
    otc: { x: 120, y: 78, s: 64 },
    real: { x: 248, y: 128, s: 52 },
    live: { x: 498, y: 98, s: 58 },
    future: { x: 612, y: 112, s: 96 },
    news: { x: 128, y: 300, s: 96 },
    risk: { x: 516, y: 292, s: 72 },
    feed: { x: 632, y: 326, s: 48 },
  },
  wires: [
    { d: 'M120 110 V200 H360', dot: [120, 200], c: '#7c5cff' },
    { d: 'M274 128 H360 V200', dot: [360, 128], c: '#9aa3b5' },
    { d: 'M498 127 V200 H360', dot: [498, 200], c: '#3b82f6' },
    { d: 'M564 112 H440 V200', dot: [440, 112], c: '#ff7a45' },
    { d: 'M176 300 H300 V200', dot: [300, 300], c: '#b9b58a' },
    { d: 'M480 292 H360 V200', dot: [360, 292], c: '#6f6fe8' },
    { d: 'M632 302 V250 H360 V200', dot: [632, 250], c: '#e0409f' },
  ],
}

const MOBILE: Layout = {
  id: 'm',
  w: 360,
  h: 460,
  core: { x: 180, y: 230, r: 44 },
  tiles: {
    otc: { x: 70, y: 70, s: 56 },
    real: { x: 180, y: 60, s: 44 },
    live: { x: 290, y: 80, s: 56 },
    future: { x: 300, y: 205, s: 72 },
    news: { x: 60, y: 230, s: 72 },
    risk: { x: 90, y: 390, s: 64 },
    feed: { x: 270, y: 380, s: 56 },
  },
  wires: [
    { d: 'M70 98 V150 H180 V230', dot: [70, 150], c: '#7c5cff' },
    { d: 'M180 82 V230', dot: [180, 120], c: '#9aa3b5' },
    { d: 'M290 108 V160 H180 V230', dot: [290, 160], c: '#3b82f6' },
    { d: 'M264 205 H180 V230', dot: [230, 205], c: '#ff7a45' },
    { d: 'M96 230 H180', dot: [130, 230], c: '#b9b58a' },
    { d: 'M90 358 V300 H180 V230', dot: [90, 300], c: '#6f6fe8' },
    { d: 'M270 352 V300 H180', dot: [270, 300], c: '#e0409f' },
  ],
}

function pct(v: number, base: number) {
  return `${(v / base) * 100}%`
}

function Diagram({ layout, className }: { layout: Layout; className?: string }) {
  const { id, w, h, core, tiles, wires } = layout
  const glow = id === 'd'
  const step = 0.9
  const cycle = wires.length * step
  return (
    <div className={`relative w-full ${className ?? ''}`} style={{ aspectRatio: `${w} / ${h}` }}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
      >
        <defs>
          <filter id={`cocoGlow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        {wires.map((wire, i) => (
          <g key={wire.d}>
            <path
              d={wire.d}
              fill="none"
              stroke="rgba(226,232,255,0.55)"
              strokeWidth="1.4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="coco-dash-seq"
              d={wire.d}
              pathLength={100}
              fill="none"
              stroke="#c4a6ff"
              strokeOpacity={glow ? 0.9 : 0.55}
              strokeWidth={glow ? 7 : 5}
              strokeLinecap="round"
              strokeDasharray="16 684"
              vectorEffect="non-scaling-stroke"
              filter={glow ? `url(#cocoGlow-${id})` : undefined}
              style={{ animationDelay: `${i * step}s`, animationDuration: `${cycle}s` }}
            />
            <path
              className="coco-dash-seq"
              d={wire.d}
              pathLength={100}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="16 684"
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${i * step}s`, animationDuration: `${cycle}s` }}
            />
            {wire.dot && (
              <circle
                cx={wire.dot[0]}
                cy={wire.dot[1]}
                r="5"
                fill="#141626"
                stroke={wire.c}
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}
      </svg>

      {TILES.map((tile, i) => {
        const p = tiles[tile.key]
        return (
          <div
            key={tile.key}
            title={tile.label}
            className="coco-tile"
            data-testid={`engine-tile-${tile.key}`}
            style={
              {
                left: pct(p.x - p.s / 2, w),
                top: pct(p.y - p.s / 2, h),
                width: pct(p.s, w),
                background: tile.bg,
                color: tile.ink,
                '--d': `${200 + i * 90}ms`,
              } as React.CSSProperties
            }
          >
            <span className="coco-tile-inner">
              <tile.icon className="coco-tile-icon" />
            </span>
          </div>
        )
      })}

      <div
        className="coco-core"
        data-testid="engine-core"
        style={{
          left: pct(core.x - core.r, w),
          top: pct(core.y - core.r, h),
          width: pct(core.r * 2, w),
        }}
      >
        <span className="coco-core-aura" aria-hidden="true" />
        <span className="coco-core-halo" aria-hidden="true" />
        <span className="coco-core-sweep" aria-hidden="true" />
        <span className="coco-core-img">
          <Image src="/coco-ai.jpg" alt="Coco AI core" fill sizes="120px" className="object-cover" />
        </span>
      </div>
    </div>
  )
}

export function CocoEngine() {
  return (
    <div className="coco-engine relative mx-auto w-full max-w-[820px]" data-testid="engine-diagram">
      <Diagram layout={DESKTOP} className="hidden sm:block" />
      <Diagram layout={MOBILE} className="mx-auto max-w-[360px] sm:hidden" />

    </div>
  )
}
