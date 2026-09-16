import Link from 'next/link'
import { Brain, Tag, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AiEngineCard } from '@/components/ai-engine-card'
import { CryptoFlow } from '@/components/crypto-flow'

export function HeroSection() {
  return (
    <section id="about" className="relative overflow-hidden">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* flowing crypto coins */}
      <CryptoFlow />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20 xl:gap-24">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <span className="border-luxe surface-luxe inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Radar className="icon-spin-slow h-3.5 w-3.5 text-foreground" />
            Next-generation algorithmic trading
          </span>

          {/* About Sweetex copy */}
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Trade smarter with{' '}
            <span className="text-gradient">Sweetex AI</span>
          </h1>

          {/* Mobile: short version */}
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:hidden">
            Sweetex AI scans the markets in real time and delivers accurate, automated
            signals - clean, data-driven decisions to grow your account.
          </p>
          {/* Desktop: full version */}
          <p className="mx-auto mt-5 hidden max-w-xl text-pretty leading-relaxed text-muted-foreground sm:block sm:text-lg lg:mx-0 lg:max-w-2xl xl:text-xl">
            Sweetex AI is an advanced trading engine that scans the markets in real time and
            delivers accurate, automated signals. No guesswork, no emotions - just clean,
            data-driven decisions built to grow your trading account with confidence.
          </p>

          {/* Get Sweetex AI */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
            <Button
              render={<Link href="/login" />}
              className="btn-luxe h-12 w-full gap-2 rounded-xl px-7 text-base font-semibold sm:w-auto"
            >
              <Brain className="icon-pulse-soft h-[18px] w-[18px]" />
              Get Sweetex AI
            </Button>
            <Button
              variant="outline"
              render={<a href="#pricing" />}
              className="btn-luxe-outline h-12 w-full gap-2 rounded-xl border-transparent px-7 text-base font-semibold sm:w-auto"
            >
              <Tag className="icon-float h-[18px] w-[18px]" />
              View Pricing
            </Button>
          </div>
        </div>

        {/* Right: animated trading card */}
        <div className="relative">
          <AiEngineCard />
        </div>
      </div>
    </section>
  )
}
