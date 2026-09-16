import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, TriangleAlert, ScrollText } from 'lucide-react'
import { GlyphTelegram } from '@/components/coco/coco-glyphs'

export function CocoFooter() {
  return (
    <footer id="support" className="coco-shade scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="coco-display coco-title-gradient mx-auto max-w-[24ch] text-balance text-[1.9rem] sm:text-[2.4rem]">
          Put the engine to work today.
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-sm text-white/60 sm:text-base">
          Traders in 30+ countries let Coco AI watch the tape while they take the trade.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/login" className="coco-btn coco-btn-primary" data-testid="footer-cta">
            Launch Coco AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="coco-rule mt-14" />

        <div className="flex flex-col items-center gap-6 py-10">
          <a href="/#top" className="flex items-center gap-2.5">
            <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/20">
              <Image
                src="/coco-ai.jpg"
                alt="Coco AI logo"
                fill
                className="object-cover"
                sizes="36px"
              />
            </span>
            <span className="coco-sub text-[17px] text-white">
              Coco <span className="coco-accent">AI</span>
            </span>
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <a
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ScrollText className="h-4 w-4" />
              Privacy policy
            </a>
            <a
              href="https://t.me/Ayan_Dead"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <GlyphTelegram className="h-4 w-4" />
              Support desk
            </a>
          </nav>
        </div>

        <div
          className="mx-auto max-w-[900px] rounded-[22px] p-[1px]"
          style={{ background: 'linear-gradient(140deg,rgba(255,176,32,0.45),rgba(255,255,255,0.06) 55%,rgba(196,166,255,0.35))' }}
          data-testid="risk-notice"
        >
          <div className="flex flex-col items-center gap-4 rounded-[21px] bg-[rgba(12,7,30,0.55)] p-5 text-center backdrop-blur-md sm:flex-row sm:items-start sm:gap-5 sm:p-7 sm:text-left">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ffb020]/30 bg-[#ffb020]/12 text-[#ffb020]">
              <TriangleAlert className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="coco-mono text-[10px] uppercase tracking-[0.14em] text-[#ffb020]">
                Trading risk notice
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/60 sm:text-[13px]">
                Trading financial instruments carries a high level of risk and may not suit every
                investor. Leverage can work against you as much as for you. Past performance of Coco
                AI is not indicative of future results. Never trade capital you cannot afford to
                lose. Coco AI provides tools and signals for informational purposes only and does not
                constitute financial advice.
              </p>
            </div>
          </div>
        </div>

        <p className="coco-mono mt-8 text-[11px] uppercase text-white/35">
          © {new Date().getFullYear()} Coco AI · All rights reserved
        </p>
      </div>
    </footer>
  )
}
