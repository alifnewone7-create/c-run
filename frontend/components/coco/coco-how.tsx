import { Route, UserRoundCheck, MousePointerClick, Crosshair } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: UserRoundCheck,
    title: 'Unlock your console',
    desc: 'Register through the partner broker or activate a direct license. Access opens in minutes.',
  },
  {
    n: '02',
    icon: MousePointerClick,
    title: 'Pick a module and pair',
    desc: 'Choose OTC or Real chart analysis, or subscribe to Live, Future and News signal feeds.',
  },
  {
    n: '03',
    icon: Crosshair,
    title: 'Execute the verdict',
    desc: 'Coco AI returns direction, confidence and timing. You place the trade, the engine keeps watching.',
  },
]

export function CocoHow() {
  return (
    <section id="how" className="coco-light scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <span className="coco-eyebrow">
          <Route className="h-3 w-3" />
          How it works
        </span>
        <h2 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[24ch] text-balance text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem]">
          From login to live signal in three moves.
        </h2>
        <p className="coco-muted mx-auto mt-4 max-w-[54ch] text-pretty text-sm sm:text-base">
          No indicators to configure, no scripts to maintain. The workflow is deliberately short so
          you spend time on decisions, not setup.
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative" data-testid={`how-step-${i + 1}`}>
              {i < STEPS.length - 1 && <span className="coco-step-line hidden sm:block" aria-hidden="true" />}
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="coco-step-num shrink-0">{s.n}</span>
                <div className="flex flex-col items-center">
                  <span className="coco-icon h-10 w-10">
                    <s.icon className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="coco-sub mt-4 text-[17px] sm:text-[19px]">{s.title}</h3>
                  <p className="coco-muted mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
