// Subtle ambient starfield that drifts slowly to give a "space" vibe.
// Positions are deterministic (seeded) so server and client render identically.

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildShadow(count: number, seed: number, size: number) {
  const rand = mulberry32(seed)
  const parts: string[] = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(2)
    const y = (rand() * 100).toFixed(2)
    parts.push(`${x}vw ${y}vh 0 ${size}px hsl(0 0% 100% / 0.9)`)
  }
  return parts.join(', ')
}

export function StarField() {
  const small = buildShadow(80, 12345, 0)
  const medium = buildShadow(40, 67890, 0.4)
  const large = buildShadow(18, 24680, 0.7)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* faint dust */}
      <div className="star-layer star-drift-slow">
        <div
          className="star-twinkle h-px w-px rounded-full"
          style={{ boxShadow: small, opacity: 0.5 }}
        />
      </div>
      {/* mid stars */}
      <div className="star-layer star-drift-mid">
        <div
          className="star-twinkle h-px w-px rounded-full"
          style={{ boxShadow: medium, opacity: 0.7, animationDelay: '1.2s' }}
        />
      </div>
      {/* bright stars */}
      <div className="star-layer star-drift-fast">
        <div
          className="star-twinkle h-px w-px rounded-full"
          style={{ boxShadow: large, animationDelay: '2.4s' }}
        />
      </div>
    </div>
  )
}
