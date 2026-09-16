import {
  ScanSearch,
  SlidersHorizontal,
  Radio,
  CalendarClock,
  ShieldCheck,
  Cpu,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'Advanced Chart Analysis',
    desc: 'Deep technical analysis across both OTC and real market pairs, surfacing precise, high-probability setups.',
    anim: 'icon-pulse-soft',
  },
  {
    icon: SlidersHorizontal,
    title: 'Instant Trade Management',
    desc: 'A built-in management system to open, monitor, and adjust your instant trades — all from one place.',
    anim: 'icon-slide',
  },
  {
    icon: Radio,
    title: 'Live 24/7 Signals',
    desc: 'Round-the-clock live signals delivered the moment opportunities appear, so you never miss a move.',
    anim: 'icon-broadcast',
  },
  {
    icon: CalendarClock,
    title: 'Future Signals',
    desc: 'Get ahead of the market with forward-looking signals timed for upcoming entries and trends.',
    anim: 'icon-tick',
  },
  {
    icon: Cpu,
    title: 'AI-Driven Accuracy',
    desc: 'Proprietary models analyze price action, volume, and momentum to maximize signal precision.',
    anim: 'icon-flicker',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Management',
    desc: 'Built-in confidence scoring helps you size positions and protect your capital intelligently.',
    anim: 'icon-beat',
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="relative scroll-mt-20 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="border-luxe surface-luxe inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Cpu className="icon-pulse-soft h-3.5 w-3.5 text-foreground" />
            Built for serious traders
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to trade with{' '}
            <span className="text-gradient">precision</span>
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            A complete algorithmic trading toolkit engineered for accuracy, speed, and consistency.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:mt-10">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border-luxe surface-luxe card-corner-glow group flex flex-col rounded-2xl p-6 shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* icon + connecting hairline */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <f.icon className={`h-5 w-5 ${f.anim}`} />
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>
              <h3 className="relative z-10 mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="relative z-10 mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
