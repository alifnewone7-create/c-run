/* Custom premium glyph set — drawn only for the dashboard.
   Consistent 32x32 grid, 1.8–2.2 stroke, currentColor. */

type GlyphProps = { className?: string }

const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/* Operator identity: shielded profile ring with data ticks */
export function GlyphOperator({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3.2 27 7v8.6c0 6.3-4.3 10.9-11 13.2-6.7-2.3-11-6.9-11-13.2V7l11-3.8Z" {...s} strokeWidth="1.9" opacity="0.5" />
      <circle cx="16" cy="14" r="3.6" fill="currentColor" />
      <path d="M10.2 23.6c.9-3 3.1-4.6 5.8-4.6s4.9 1.6 5.8 4.6" {...s} strokeWidth="2.1" />
      <path d="M16 3.2v3M27 11h-2.6M7.6 11H5" {...s} strokeWidth="1.8" opacity="0.8" />
    </svg>
  )
}

/* Tier: layered licence plate with a verified notch */
export function GlyphTier({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2.8l4.2 2.9 5.1.3.9 5 3 4.1-3 4.1-.9 5-5.1.3L16 27.4l-4.2-2.9-5.1-.3-.9-5L2.8 15l3-4.1.9-5 5.1-.3L16 2.8Z" {...s} strokeWidth="1.8" opacity="0.45" />
      <path d="M11.4 15.6l3.1 3.2 6.1-6.6" {...s} strokeWidth="2.4" />
      <path d="M11 23.4 9 29.2l4.4-1.9M21 23.4l2 5.8-4.4-1.9" {...s} strokeWidth="1.8" opacity="0.75" />
    </svg>
  )
}

/* Toolkit: modular grid with one active module */
export function GlyphToolkit({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="4" y="4" width="10" height="10" rx="3" fill="currentColor" />
      <rect x="18" y="4" width="10" height="10" rx="3" {...s} strokeWidth="2" opacity="0.6" />
      <rect x="4" y="18" width="10" height="10" rx="3" {...s} strokeWidth="2" opacity="0.6" />
      <circle cx="23" cy="23" r="5" {...s} strokeWidth="2.1" />
      <path d="M23 20.6v4.8M20.6 23h4.8" {...s} strokeWidth="2.1" />
    </svg>
  )
}

/* Quota meter: dial with a needle */
export function GlyphQuota({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4.5 23a12.5 12.5 0 1 1 23 0" {...s} strokeWidth="2.2" />
      <path d="M8.4 12.2 6.6 10M16 6.6V3.8M23.6 12.2 25.4 10" {...s} strokeWidth="1.8" opacity="0.7" />
      <path d="M16 22 21.4 13" {...s} strokeWidth="2.4" />
      <circle cx="16" cy="22.6" r="2.4" fill="currentColor" />
    </svg>
  )
}

/* OTC analyzer: reversal loop inside a scan aperture */
export function GlyphScanOtc({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M7 4H4.6A1.6 1.6 0 0 0 3 5.6V8M25 4h2.4A1.6 1.6 0 0 1 29 5.6V8M3 24v2.4A1.6 1.6 0 0 0 4.6 28H7M29 24v2.4A1.6 1.6 0 0 1 27.4 28H25" {...s} strokeWidth="1.9" opacity="0.55" />
      <path d="M22.4 13.4A7 7 0 0 0 10 12.4M9.6 18.6A7 7 0 0 0 22 19.6" {...s} strokeWidth="2.2" />
      <path d="M9.6 9.6v3.6h3.6M22.4 22.4v-3.6h-3.6" {...s} strokeWidth="2.2" />
      <circle cx="16" cy="16" r="2.1" fill="currentColor" />
    </svg>
  )
}

/* Real chart: candle set with trend line */
export function GlyphCandles({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M8 5.5v21M16 4v24M24 7.5v19" {...s} strokeWidth="1.6" opacity="0.45" />
      <rect x="5.6" y="12" width="4.8" height="9" rx="1.4" fill="currentColor" opacity="0.85" />
      <rect x="13.6" y="8" width="4.8" height="12" rx="1.4" fill="currentColor" />
      <rect x="21.6" y="13" width="4.8" height="7" rx="1.4" fill="currentColor" opacity="0.85" />
      <path d="M4 25.6c4-1 6.4-5.8 10-6.4 3.6-.6 5 2.9 8 1.9 3-1 4.4-4.4 6.4-5.9" {...s} strokeWidth="2" />
    </svg>
  )
}

/* Future signals: orbit with forward star */
export function GlyphOrbit({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="14.6" cy="16.6" r="6.2" fill="currentColor" />
      <path d="M3.4 21c4 3.4 15.2 1 20.6-4.4 5.4-5.4 5.8-10.3 3.4-11.8" {...s} strokeWidth="2" opacity="0.75" />
      <path d="M4.6 12.4c3-4.9 11.8-7.4 17.6-3.9" {...s} strokeWidth="1.6" opacity="0.35" />
      <path d="M25.4 21.4l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" fill="currentColor" />
    </svg>
  )
}

/* News signals: broadcast sheet */
export function GlyphNewsWire({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 6.5h15.5a2 2 0 0 1 2 2v14a3 3 0 0 0 3 3H8.5a2.5 2.5 0 0 1-2.5-2.5v-16.5Z" {...s} strokeWidth="2" />
      <path d="M23.5 12.5H26a2 2 0 0 1 2 2v8.5a2.5 2.5 0 0 1-4.5 1.5" {...s} strokeWidth="1.8" opacity="0.6" />
      <rect x="9.5" y="10" width="7" height="5.5" rx="1.4" fill="currentColor" />
      <path d="M19 10.5h1.5M9.5 19h11M9.5 22.4h7.5" {...s} strokeWidth="2" />
    </svg>
  )
}

/* Live signals: bolt in broadcast rings */
export function GlyphPulseLive({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6.4 7.4a13.6 13.6 0 0 0 0 17.2M25.6 7.4a13.6 13.6 0 0 1 0 17.2" {...s} strokeWidth="2" opacity="0.4" />
      <path d="M10.6 11.2a7.4 7.4 0 0 0 0 9.6M21.4 11.2a7.4 7.4 0 0 1 0 9.6" {...s} strokeWidth="2" opacity="0.7" />
      <path d="M17.6 7.4 13 17h3.5l-1 7.6 5-10h-3.4l.5-7.2Z" fill="currentColor" />
    </svg>
  )
}

/* Injector: syringe driving a bolt into a candle */
export function GlyphInjector({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M8 24 24 8" {...s} strokeWidth="2.2" />
      <path d="M11.5 20.5 6.5 25.5M20.5 11.5l3-3M21 6l5 5" {...s} strokeWidth="2" />
      <path d="M12 14.5l5.5 5.5M15 11.5l5.5 5.5" {...s} strokeWidth="1.8" opacity="0.55" />
      <path d="M9.6 15.2 16.8 8l7.2 7.2-7.2 7.2z" {...s} strokeWidth="2" />
      <circle cx="16.8" cy="15.2" r="1.6" fill="currentColor" />
    </svg>
  )
}

/* Management: console sliders */
export function GlyphConsole({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 9.5h20M6 16h20M6 22.5h20" {...s} strokeWidth="2" opacity="0.45" />
      <circle cx="12" cy="9.5" r="3.2" fill="currentColor" />
      <circle cx="21" cy="16" r="3.2" fill="currentColor" />
      <circle cx="14" cy="22.5" r="3.2" fill="currentColor" />
    </svg>
  )
}

/* Mail rune */
export function GlyphMailRune({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3.5" y="7" width="25" height="18" rx="4" {...s} strokeWidth="2" />
      <path d="M5.5 10.5 16 18l10.5-7.5" {...s} strokeWidth="2.1" />
    </svg>
  )
}

/* Identity key */
export function GlyphKeyId({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="11" cy="12" r="5.5" {...s} strokeWidth="2.1" />
      <path d="M14.6 15.6 26 27M22 23l-2.6 2.6M25 20l-2.6 2.6" {...s} strokeWidth="2.1" />
    </svg>
  )
}

/* Clock ring */
export function GlyphClockRing({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="12" {...s} strokeWidth="2" opacity="0.55" />
      <path d="M16 9.5V16l4.6 3" {...s} strokeWidth="2.3" />
    </svg>
  )
}

/* Infinity ribbon */
export function GlyphInfinite({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 16c-2-3.4-3.8-5-6.2-5a5 5 0 0 0 0 10c2.4 0 4.2-1.6 6.2-5 2-3.4 3.8-5 6.2-5a5 5 0 0 1 0 10c-2.4 0-4.2-1.6-6.2-5Z" {...s} strokeWidth="2.3" />
    </svg>
  )
}

/* Lock vault */
export function GlyphVault({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="6" y="14" width="20" height="14" rx="4.5" {...s} strokeWidth="2.1" />
      <path d="M11 14v-3.5a5 5 0 0 1 10 0V14" {...s} strokeWidth="2.1" />
      <circle cx="16" cy="21" r="2.2" fill="currentColor" />
    </svg>
  )
}

/* Arrow corner for card links */
export function GlyphArrowCorner({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 16 16 8M9.5 8H16v6.5" {...s} strokeWidth="2.2" />
    </svg>
  )
}
