/* Premium, custom-drawn glyphs used only by the OTC / Real analyzer switch. */

type GlyphProps = { className?: string }

const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/* OTC: a cut prism with a two-way swap core (synthetic / over-the-counter flow) */
export function GlyphOtcPrism({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3.4 28 10v12L16 28.6 4 22V10L16 3.4Z" {...s} strokeWidth="1.9" opacity="0.5" />
      <path d="M4 10l12 6.4 12-6.4M16 16.4v12.2" {...s} strokeWidth="1.5" opacity="0.28" />
      <path d="M11.4 13.6h7.2l-2.2-2.4M20.6 18.4h-7.2l2.2 2.4" {...s} strokeWidth="2.2" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

/* Real: live tape — trend line breaking out of a rounded aperture with a pulse head */
export function GlyphRealPulse({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M27.5 12V9.2A3.7 3.7 0 0 0 23.8 5.5H8.2A3.7 3.7 0 0 0 4.5 9.2v13.6a3.7 3.7 0 0 0 3.7 3.7h12"
        {...s}
        strokeWidth="1.9"
        opacity="0.5"
      />
      <path d="M8.6 19.8l4.2-5.2 3.3 2.9 4.4-6" {...s} strokeWidth="2.3" />
      <path d="M17.6 11.5h3.6v3.6" {...s} strokeWidth="2.1" />
      <circle cx="24.8" cy="22.2" r="4.4" {...s} strokeWidth="1.7" opacity="0.45" />
      <circle cx="24.8" cy="22.2" r="1.9" fill="currentColor" />
    </svg>
  )
}
