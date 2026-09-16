'use client'

import { TopNav } from '@/components/top-nav'
import { CocoBottomNav } from '@/components/coco/coco-bottom-nav'
import { CocoHeroBg } from '@/components/coco/coco-hero-bg'

type Props = {
  eyebrow: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  testid: string
  width?: string
  children: React.ReactNode
}

/* Shared page shell so every app page carries the home-page grading. */
export function CocoPageShell({
  eyebrow,
  icon: Icon,
  title,
  desc,
  testid,
  width = 'max-w-[980px]',
  children,
}: Props) {
  return (
    <div className="coco relative min-h-dvh bg-[#0b0618]" data-testid={testid}>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] [&>*]:pointer-events-auto">
        <TopNav bottomNav={false} />
      </div>
      <CocoBottomNav />

      <div className="coco-dark min-h-dvh">
        <div className="relative overflow-hidden pt-0 md:pt-[84px]">
          <CocoHeroBg />

          <div
            className={`relative z-10 mx-auto flex w-full ${width} flex-col gap-5 px-4 pb-32 pt-6 sm:gap-6 sm:px-6 sm:pt-9 md:pb-20`}
          >
            <header className="coco-rise" style={{ '--d': '60ms' } as React.CSSProperties}>
              <span className="coco-eyebrow">
                <Icon className="h-3 w-3" />
                {eyebrow}
              </span>
              <h1 className="coco-display coco-title-gradient mt-3.5 text-balance text-[1.65rem] sm:text-[2.15rem] lg:text-[2.45rem]">
                {title}
              </h1>
              <p className="mt-2.5 max-w-[62ch] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                {desc}
              </p>
              <span className="coco-rule mt-5 block h-px w-full" aria-hidden="true" />
            </header>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
