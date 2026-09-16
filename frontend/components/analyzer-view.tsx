'use client'

import { TopNav } from '@/components/top-nav'
import { CocoBottomNav } from '@/components/coco/coco-bottom-nav'
import { CocoHeroBg } from '@/components/coco/coco-hero-bg'
import { AuthGuard } from '@/components/auth-guard'
import { ChartAnalyzer } from '@/components/chart-analyzer'
import { AnalyzerModeSwitch } from '@/components/analyzer-mode-switch'

type Mode = 'otc' | 'real'

export function AnalyzerView({ mode }: { mode: Mode }) {
  return (
    <AuthGuard>
      {() => (
        <div
          className="coco coco-analyzer relative min-h-dvh bg-[#0b0618]"
          data-testid={`analyzer-page-${mode}`}
        >
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] [&>*]:pointer-events-auto">
            <TopNav bottomNav={false} />
          </div>
          <CocoBottomNav />

          <div className="coco-dark min-h-dvh">
            <div className="relative overflow-hidden pt-0 md:pt-[84px]">
              <CocoHeroBg />

              <div className="relative z-10 mx-auto flex max-w-[980px] flex-col gap-5 px-4 pb-32 pt-6 sm:px-6 sm:pt-8 md:pb-20">
                <AnalyzerModeSwitch mode={mode} />

                <ChartAnalyzer mode={mode} />
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
