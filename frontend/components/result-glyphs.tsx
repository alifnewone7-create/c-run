/* Custom-drawn glyphs for the chart analysis result card. */

type GlyphProps = { className?: string }

const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/* Bold directional arrow with trailing speed echoes */
export function GlyphSurgeUp({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 7v16" {...s} strokeWidth="3.2" />
      <path d="M8.6 14.4 16 7l7.4 7.4" {...s} strokeWidth="3.2" />
      <path className="ar-echo ar-echo-1" d="M11 26.5h10" {...s} strokeWidth="2.2" />
      <path className="ar-echo ar-echo-2" d="M13.5 30h5" {...s} strokeWidth="2" />
    </svg>
  )
}

export function GlyphSurgeDown({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 25V9" {...s} strokeWidth="3.2" />
      <path d="M8.6 17.6 16 25l7.4-7.4" {...s} strokeWidth="3.2" />
      <path className="ar-echo ar-echo-1" d="M11 5.5h10" {...s} strokeWidth="2.2" />
      <path className="ar-echo ar-echo-2" d="M13.5 2h5" {...s} strokeWidth="2" />
    </svg>
  )
}

/* Hold: hexagonal shield with two pause bars */
export function GlyphHold({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3.5 27 9.8v12.4L16 28.5 5 22.2V9.8L16 3.5Z" {...s} strokeWidth="1.9" opacity="0.55" />
      <path d="M12.6 11.5v9M19.4 11.5v9" {...s} strokeWidth="3" />
    </svg>
  )
}

/* Trend: stepping trend path breaking above a level with a live head */
export function GlyphTrend({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 20.5h24" {...s} strokeWidth="1.4" strokeDasharray="2.4 3" opacity="0.4" />
      <path className="ar-draw" d="M5 25l5.2-5.6 3.6 3 4.6-6.2 3.2 2.4L27 9.5" {...s} strokeWidth="2.3" />
      <path d="M22.4 9.5H27v4.6" {...s} strokeWidth="2.1" />
      <circle className="ar-blink" cx="27" cy="9.5" r="2.1" fill="currentColor" />
    </svg>
  )
}

/* Pattern: three candles, centre engulfing body */
export function GlyphCandles({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M8 6.5v19" {...s} strokeWidth="1.5" opacity="0.5" />
      <rect x="5.4" y="11" width="5.2" height="8.4" rx="1.3" {...s} strokeWidth="1.7" opacity="0.7" />
      <path d="M16 3.5v25" {...s} strokeWidth="1.5" opacity="0.5" />
      <rect className="ar-candle-pulse" x="13" y="8" width="6" height="15" rx="1.4" fill="currentColor" />
      <path d="M24 8v17" {...s} strokeWidth="1.5" opacity="0.5" />
      <rect x="21.4" y="12.5" width="5.2" height="8" rx="1.3" {...s} strokeWidth="1.7" opacity="0.7" />
    </svg>
  )
}

/* Details: stacked planes */
export function GlyphLayers({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path className="ar-layer ar-layer-1" d="M16 5.5 27 11l-11 5.5L5 11l11-5.5Z" {...s} strokeWidth="2" />
      <path className="ar-layer ar-layer-2" d="M6.6 16.2 16 20.9l9.4-4.7" {...s} strokeWidth="1.9" opacity="0.65" />
      <path className="ar-layer ar-layer-3" d="M6.6 21.2 16 25.9l9.4-4.7" {...s} strokeWidth="1.9" opacity="0.35" />
    </svg>
  )
}

/* Market structure: swing highs / lows with level rails */
export function GlyphStructure({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 9.5h7M21 9.5h7M4 22.5h7M21 22.5h7" {...s} strokeWidth="1.4" opacity="0.4" />
      <path d="M5 24l5.5-9 4.5 6 5-11 4 6.5 4-6.5" {...s} strokeWidth="2.2" />
      <circle cx="20" cy="10" r="1.7" fill="currentColor" />
      <circle cx="10.5" cy="15" r="1.7" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

/* Indicators: oscillating wave with sample points */
export function GlyphWave({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 16h24" {...s} strokeWidth="1.3" strokeDasharray="2 3" opacity="0.4" />
      <path d="M4 16c3-8 6-8 9 0s6 8 9 0 4-6 6-4" {...s} strokeWidth="2.2" />
      <circle cx="13" cy="16" r="1.8" fill="currentColor" />
      <circle cx="22" cy="16" r="1.8" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

/* Scores: gauge arc with needle */
export function GlyphGauge({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M5.5 22.5A11.5 11.5 0 0 1 26.5 22.5" {...s} strokeWidth="2.2" opacity="0.4" />
      <path d="M5.5 22.5A11.5 11.5 0 0 1 12 12.4" {...s} strokeWidth="2.4" />
      <path d="M16 22.5 21.5 13.5" {...s} strokeWidth="2.3" />
      <circle cx="16" cy="22.5" r="2.2" fill="currentColor" />
    </svg>
  )
}

/* Reasoning: neural core with radiating nodes */
export function GlyphCore({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="10" y="10" width="12" height="12" rx="3" {...s} strokeWidth="2" />
      <path d="M16 4v6M16 22v6M4 16h6M22 16h6M7.5 7.5 10 10M24.5 7.5 22 10M7.5 24.5 10 22M24.5 24.5 22 22" {...s} strokeWidth="1.7" opacity="0.55" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  )
}
