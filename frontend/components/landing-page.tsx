import { CocoNavbar } from '@/components/coco/coco-navbar'
import { CocoHero } from '@/components/coco/coco-hero'
import { CocoFeatures } from '@/components/coco/coco-features'
import { CocoComparison } from '@/components/coco/coco-comparison'
import { CocoHow } from '@/components/coco/coco-how'
import { CocoTerminal } from '@/components/coco/coco-terminal'
import { CocoPricing } from '@/components/coco/coco-pricing'
import { CocoTestimonials } from '@/components/coco/coco-testimonials'
import { CocoFaq } from '@/components/coco/coco-faq'
import { CocoFooter } from '@/components/coco/coco-footer'

export function LandingPage() {
  return (
    <div id="top" className="coco min-h-dvh bg-[#0b0618]" data-testid="landing-page">
      <div className="coco-dark">
        <CocoNavbar />
        <CocoHero />
      </div>
      <main>
        <CocoPricing />
        <CocoComparison />
        <CocoHow />
        <CocoTerminal />
        <CocoFeatures />
        <CocoTestimonials />
        <CocoFaq />
      </main>
      <CocoFooter />
    </div>
  )
}
