'use client'

import { Telescope, Newspaper, Radio, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { StarField } from '@/components/star-field'
import { TopNav } from '@/components/top-nav'
import { AuthGuard } from '@/components/auth-guard'

const iconMap: Record<string, LucideIcon> = {
  telescope: Telescope,
  newspaper: Newspaper,
  radio: Radio,
  management: SlidersHorizontal,
}

export function PlaceholderView({
  title,
  icon,
}: {
  title: string
  icon: keyof typeof iconMap
}) {
  const Icon = iconMap[icon] ?? Telescope
  return (
    <AuthGuard>
      {() => (
        <main className="relative min-h-dvh bg-background">
          <StarField />
          <TopNav />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
            <section className="border-luxe surface-luxe card-corner-glow relative flex min-h-[50vh] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl p-8 text-center">
              <span className="btn-luxe flex h-14 w-14 items-center justify-center rounded-2xl">
                <Icon className="icon-float h-7 w-7 text-primary-foreground" />
              </span>
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Nothing here yet.
              </p>
            </section>
          </div>
        </main>
      )}
    </AuthGuard>
  )
}
