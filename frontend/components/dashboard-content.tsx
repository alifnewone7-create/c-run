'use client'

import { TopNav } from '@/components/top-nav'
import { CocoBottomNav } from '@/components/coco/coco-bottom-nav'
import { CocoHeroBg } from '@/components/coco/coco-hero-bg'
import { DashProfile } from '@/components/dashboard/dash-profile'
import { DashTier } from '@/components/dashboard/dash-tier'
import { DashTools } from '@/components/dashboard/dash-tools'
import { type UserProfile } from '@/components/auth-provider'

export function DashboardContent({ profile }: { profile: UserProfile }) {
  return (
    <div className="coco relative min-h-dvh bg-[#0b0618]" data-testid="dashboard-page">
      {/* Navigation layers live above every zone so they are never covered */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] [&>*]:pointer-events-auto">
        <TopNav bottomNav={false} />
      </div>
      <CocoBottomNav />

      {/* 1 — Profile (dark zone, same grading as the home hero) */}
      <div className="coco-dark">
        <div className="relative overflow-hidden pt-0 md:pt-[84px]">
          <CocoHeroBg />
          <DashProfile profile={profile} />
        </div>
      </div>

      {/* 2 — Tier + quota (light zone lifted by the home-page curve) */}
      <main className="pb-28 md:pb-0">
        <DashTier />
        {/* 3 — Tools */}
        <DashTools />
      </main>
    </div>
  )
}
