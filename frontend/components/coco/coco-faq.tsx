import { Plus, CircleHelp } from 'lucide-react'
import { GlyphTelegram } from '@/components/coco/coco-glyphs'

const FAQS = [
  {
    q: 'What markets does Coco AI cover?',
    a: 'Coco AI monitors 42 pairs across forex, metals, crypto and OTC instruments. OTC coverage runs through weekends when regular markets are closed.',
  },
  {
    q: 'How is the OTC Analyzer different from the Real Chart Analyzer?',
    a: 'The Real Chart Analyzer reads genuine market structure and issues a direct 1-minute verdict. The OTC Analyzer applies reverse-logic tuned for broker-generated OTC feeds, where naive reads are often traps.',
  },
  {
    q: 'How accurate are the signals?',
    a: 'Every verdict carries a confidence score. Historically, signals released at 90%+ confidence have printed a 96.4% win rate. Past performance does not guarantee future results.',
  },
  {
    q: 'Do I need to pay to get access?',
    a: 'No. Register with our partner broker, fund a minimum of $50 and verify your UID with the support desk to unlock the engine at no cost. A $99 direct monthly license is available if you prefer to skip the broker route.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The console, chart analyzers and every signal feed are fully responsive and run in any modern mobile browser without an app install.',
  },
  {
    q: 'Is Coco AI financial advice?',
    a: 'No. Coco AI is a decision-support tool. It provides data-driven signals for informational purposes only. You remain fully responsible for every trade you place.',
  },
]

export function CocoFaq() {
  return (
    <section id="faq" className="coco-light scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 pb-16 text-center sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="coco-rule" />
        <div className="mt-12 flex flex-col items-center sm:mt-14">
          <span className="coco-eyebrow">
            <CircleHelp className="h-3 w-3" />
            FAQ
          </span>
          <h2 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[24ch] text-balance text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem]">
            Questions traders ask before they launch.
          </h2>
          <p className="coco-muted mx-auto mt-4 max-w-[48ch] text-sm sm:text-base">
            Still unsure? The support desk answers within minutes on Telegram.
          </p>
          <a
            href="https://t.me/Ayan_Dead"
            target="_blank"
            rel="noopener noreferrer"
            className="coco-btn coco-btn-ghost mt-7"
            data-testid="faq-support-cta"
          >
            <GlyphTelegram className="h-4 w-4" />
            Message support
          </a>
        </div>

        <div className="mx-auto mt-12 flex max-w-[860px] flex-col gap-3 text-left" data-testid="faq-list">
            {FAQS.map((f, i) => (
              <details key={f.q} className="coco-faq" data-testid={`faq-item-${i + 1}`} open={i === 0}>
                <summary>
                  {f.q}
                  <span className="coco-faq-chev">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </summary>
                <div className="coco-faq-body">{f.a}</div>
              </details>
            ))}
          </div>
      </div>
    </section>
  )
}
