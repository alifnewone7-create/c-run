'use client'

import Link from 'next/link'
import {
  ScanLine,
  ScanSearch,
  Telescope,
  Newspaper,
  Radio,
  SlidersHorizontal,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

type Tool = {
  name: string
  subtitle: string
  href: string
  icon: LucideIcon
  /** oklch hue */
  hue: number
  /** oklch chroma */
  chroma: number
}

/* Purple main + emerald & gold secondaries */
const PURPLE = { hue: 285, chroma: 0.2 }
const EMERALD = { hue: 165, chroma: 0.14 }
const GOLD = { hue: 88, chroma: 0.12 }

const tools: Tool[] = [
  {
    name: 'OTC Chart Analyzer',
    subtitle: 'AI reverse-logic OTC signal.',
    href: '/otc-chart-analyzer',
    icon: ScanLine,
    ...PURPLE,
  },
  {
    name: 'Real Chart Analyzer',
    subtitle: 'Direct 1-minute trade signal.',
    href: '/real-chart-analyzer',
    icon: ScanSearch,
    ...EMERALD,
  },
  {
    name: 'Future Signals',
    subtitle: 'Look ahead of the market.',
    href: '/future-signals',
    icon: Telescope,
    ...GOLD,
  },
  {
    name: 'News Signals',
    subtitle: 'Trade on breaking news.',
    href: '/news-signals',
    icon: Newspaper,
    ...PURPLE,
  },
  {
    name: 'Live Signals',
    subtitle: 'Real-time entries as they fire.',
    href: '/live-signals',
    icon: Radio,
    ...EMERALD,
  },
  {
    name: 'Management',
    subtitle: 'Control your workspace.',
    href: '/management',
    icon: SlidersHorizontal,
    ...GOLD,
  },
]

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { hue, chroma } = tool
  const base = `oklch(0.62 ${chroma} ${hue})`
  const light = `oklch(0.78 ${chroma * 0.8} ${hue})`
  const dark = `oklch(0.4 ${chroma * 0.85} ${hue})`
  const glow = `oklch(0.62 ${chroma} ${hue} / 0.55)`
  const glowSoft = `oklch(0.62 ${chroma} ${hue} / 0.14)`

  return (
    <Link
      href={tool.href}
      style={
        {
          '--c': base,
          '--c-light': light,
          '--c-dark': dark,
          '--c-glow': glow,
          '--c-glow-soft': glowSoft,
          animationDelay: `${index * 80}ms`,
        } as React.CSSProperties
      }
      className="group animate-in fade-in slide-in-from-bottom-3 relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[color:var(--c-glow-soft)] bg-[oklch(0.19_0.04_274)] p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[color:var(--c-glow)] hover:shadow-[0_18px_45px_-22px_var(--c-glow)] sm:p-5"
    >
      {/* left accent bar that lights up on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 opacity-40 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'linear-gradient(180deg, var(--c-light), var(--c-dark))' }}
      />

      {/* refined icon tile */}
      <span
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-transform duration-500 group-hover:scale-105"
        style={{
          background: 'linear-gradient(150deg, var(--c-light), var(--c-dark))',
          borderColor: 'var(--c-light)',
          boxShadow:
            'inset 0 1px 4px oklch(1 0 0 / 0.3), inset 0 -6px 12px oklch(0 0 0 / 0.3), 0 8px 22px -10px var(--c-glow)',
        }}
      >
        <tool.icon className="h-5 w-5 text-[oklch(0.99_0_0)] drop-shadow-[0_1px_3px_oklch(0_0_0/0.4)]" />
      </span>

      {/* labels */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {tool.name}
        </h3>
        <p className="mt-0.5 truncate text-[13px] leading-relaxed text-muted-foreground">
          {tool.subtitle}
        </p>
      </div>

      {/* open indicator */}
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--c-glow-soft)] text-muted-foreground transition-all duration-500 group-hover:border-[color:var(--c-glow)] group-hover:text-[color:var(--c-light)]"
      >
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  )
}

export function ToolCards() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {tools.map((tool, i) => (
        <ToolCard key={tool.href} tool={tool} index={i} />
      ))}
    </div>
  )
}
