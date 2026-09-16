import Image from 'next/image'
import { Check, X, GitCompareArrows } from 'lucide-react'

const OTHERS = [
  'Generic signals copied from public feeds',
  'No OTC reverse-logic engine',
  'No confidence score on any call',
  'Delayed alerts after the move is gone',
  'Cluttered, confusing dashboards',
  'Hidden upsells and locked features',
  'Weekends completely dead',
  'Slow or missing human support',
]

const COCO = [
  'Four proprietary models vote on every candle',
  'Dedicated OTC reverse-logic analyzer',
  'Confidence score on every single verdict',
  'Real-time alerts the second confluence forms',
  'One clean console, five focused modules',
  'Free partner access or one flat license',
  'OTC coverage running 24 / 7 all weekend',
  'Telegram desk replying in minutes',
]

export function CocoComparison() {
  return (
    <section id="compare" className="coco-light scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <span className="coco-eyebrow">
          <GitCompareArrows className="h-3 w-3" />
          Comparison
        </span>
        <h2 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[24ch] text-balance text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem]">
          Other AI tools guess. Coco AI decides.
        </h2>
        <p className="coco-muted mx-auto mt-4 max-w-[54ch] text-pretty text-sm sm:text-base">
          Same market, two very different reads. Here is what changes the moment you switch.
        </p>

        <div
          className="relative mx-auto mt-12 grid max-w-[1020px] items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-0"
          data-testid="comparison-grid"
        >
          {/* Other platforms */}
          <article
            className="rounded-[26px] border border-[var(--hairline)] bg-[#f2f1f5] p-6 text-left sm:p-8 lg:pr-12"
            data-testid="comparison-other"
          >
            <h3 className="coco-display text-center text-[1.15rem] uppercase tracking-[0.04em] text-[#3b3b44] sm:text-[1.6rem]">
              Other AI platforms
            </h3>
            <div className="mt-5 h-px w-full bg-[rgba(20,20,20,0.08)]" />
            <ul className="mt-5 flex flex-col gap-3.5 sm:gap-4">
              {OTHERS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#dcdae2] text-[#6b6b78]">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-snug text-[#5c5c68] sm:text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* V/S badge */}
          <div className="relative z-10 flex items-center justify-center lg:mx-[-24px]">
            <span
              className="coco-mono inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#111119] text-[11px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_10px_30px_rgba(12,8,30,0.35)] sm:h-14 sm:w-14 sm:text-[13px]"
              data-testid="comparison-vs"
            >
              V/S
            </span>
          </div>

          {/* Coco AI */}
          <div
            className="rounded-[26px] p-[1.5px]"
            style={{ background: 'linear-gradient(150deg,#ff5f6d 0%,#a855f7 46%,#6d3bff 100%)' }}
            data-testid="comparison-coco"
          >
            <article className="h-full rounded-[25px] bg-white p-6 text-left sm:p-8 lg:pl-12">
              <div className="flex items-center justify-center gap-2.5">
                <span className="relative h-8 w-8 overflow-hidden rounded-xl ring-1 ring-[var(--hairline)] sm:h-9 sm:w-9">
                  <Image src="/coco-ai.jpg" alt="Coco AI" fill sizes="36px" className="object-cover" />
                </span>
                <h3 className="coco-display text-[1.15rem] text-[#141414] sm:text-[1.6rem]">
                  Coco <span className="coco-accent-gradient">AI</span>
                </h3>
              </div>
              <div className="mt-5 h-px w-full bg-[var(--hairline)]" />
              <ul className="mt-5 flex flex-col gap-3.5 sm:gap-4">
                {COCO.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(145deg,#8a4cf0,#4a1f9e)] text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium leading-snug text-[#1d1d24] sm:text-[15px]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
