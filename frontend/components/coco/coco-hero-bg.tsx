const CANDLES: [number, number, number, number][] = [
  // x, bodyTop, bodyHeight, dir (1 up / 0 down)
  [20, 86, 26, 1],
  [44, 70, 34, 1],
  [68, 92, 20, 0],
  [92, 58, 40, 1],
  [116, 46, 24, 1],
  [140, 66, 30, 0],
  [164, 40, 34, 1],
  [188, 28, 26, 1],
  [212, 52, 22, 0],
  [236, 30, 38, 1],
  [260, 18, 28, 1],
  [284, 44, 24, 0],
  [308, 24, 34, 1],
  [332, 12, 30, 1],
  [356, 36, 22, 0],
  [380, 16, 36, 1],
]

export function CocoHeroBg() {
  return (
    <div className="coco-hero-bg" aria-hidden="true">
      <span className="coco-hero-glow coco-hero-glow-a" />
      <span className="coco-hero-glow coco-hero-glow-b" />
      <span className="coco-hero-glow coco-hero-glow-c" />

      <svg className="coco-hero-candles" viewBox="0 0 400 130" preserveAspectRatio="none">
        {CANDLES.map(([x, top, h, up]) => (
          <g key={x} fill={up ? '#4ade80' : '#fb7185'} stroke={up ? '#4ade80' : '#fb7185'}>
            <line x1={x + 5} y1={top - 9} x2={x + 5} y2={top + h + 9} strokeWidth="1" />
            <rect x={x} y={top} width="10" height={h} rx="1.5" />
          </g>
        ))}
      </svg>
    </div>
  )
}
