'use client'

import Link from 'next/link'
import {
  GlyphToolkit,
  GlyphOrbit,
  GlyphNewsWire,
  GlyphPulseLive,
  GlyphInjector,
  GlyphConsole,
  GlyphArrowCorner,
} from '@/components/dashboard/dash-glyphs'
import { GlyphOtcPrism, GlyphRealPulse } from '@/components/analyzer-glyphs'

type Glyph = ({ className }: { className?: string }) => JSX.Element

type Tool = {
  name: string
  subtitle: string
  href: string
  glyph: Glyph
  light: string
  dark: string
  soft: string
}

const IRIS = { light: '#a688ff', dark: '#6d3bff', soft: '#d8c9ff' }
const EMERALD = { light: '#6ddcae', dark: '#189a72', soft: '#b9f3dd' }
const GOLD = { light: '#f3c775', dark: '#c2820f', soft: '#f6e3b8' }
const AZURE = { light: '#8fb8ff', dark: '#3b62d8', soft: '#cbdcff' }
const ORCHID = { light: '#f0a3ff', dark: '#b13fd6', soft: '#f3d3ff' }

const TOOLS: Tool[] = [
  {
    name: 'OTC Chart Analyzer',
    subtitle: 'AI reverse-logic OTC verdict.',
    href: '/otc-chart-analyzer',
    glyph: GlyphOtcPrism,
    ...IRIS,
  },
  {
    name: 'Real Chart Analyzer',
    subtitle: 'Direct 1-minute trade signal.',
    href: '/real-chart-analyzer',
    glyph: GlyphRealPulse,
    ...EMERALD,
  },
  {
    name: 'Future Signals',
    subtitle: 'Scheduled calls, ahead of the move.',
    href: '/future-signals',
    glyph: GlyphOrbit,
    ...GOLD,
  },
  {
    name: 'News Signals',
    subtitle: 'Trade the headline as it lands.',
    href: '/news-signals',
    glyph: GlyphNewsWire,
    ...AZURE,
  },
  {
    name: 'Live Signals',
    subtitle: 'Real-time entries as they fire.',
    href: '/live-signals',
    glyph: GlyphPulseLive,
    ...IRIS,
  },
  {
    name: 'Coco Injector',
    subtitle: 'Timed 2 / 5 / 10 minute injections.',
    href: '/injector',
    glyph: GlyphInjector,
    ...ORCHID,
  },
  {
    name: 'Management',
    subtitle: 'Account, licence and workspace.',
    href: '/management',
    glyph: GlyphConsole,
    ...EMERALD,
  },
]

export function DashTools() {
  return (
    <section id="tools" className="coco-light scroll-mt-24" data-testid="dashboard-tools">
      <div className="mx-auto max-w-[1140px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="coco-d2-panel">
          <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:items-center">
            <span className="coco-icon h-11 w-11 flex-none">
              <GlyphToolkit className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="coco-sub text-[18px] sm:text-[21px]">Trading tools</h2>
              <p className="coco-muted mt-0.5 text-[13px] sm:text-sm">
                Seven AI systems, one console. Pick a desk and start reading the market.
              </p>
            </div>
            <span className="coco-mono hidden rounded-full border border-[var(--hairline)] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--dim)] sm:inline-flex">
              7 modules
            </span>
          </div>

          <div className="my-5 h-px w-full bg-gradient-to-r from-[#d8c9ff] via-[var(--hairline)] to-transparent" />

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="coco-d2-tool coco-rise"
                style={
                  {
                    '--t-light': tool.light,
                    '--t-dark': tool.dark,
                    '--t-soft': tool.soft,
                    '--t-shadow': `${tool.dark}59`,
                    '--d': `${i * 70}ms`,
                  } as React.CSSProperties
                }
              >
                <span className="coco-d2-tool-icon">
                  <tool.glyph className="h-[23px] w-[23px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold tracking-tight text-[var(--ink)]">
                    {tool.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-[#77777f]">
                    {tool.subtitle}
                  </span>
                </span>
                <span className="coco-d2-tool-go">
                  <GlyphArrowCorner className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
