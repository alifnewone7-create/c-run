import {
  UserRoundPlus,
  CircleDollarSign,
  BadgeCheck,
  KeyRound,
  Headset,
  Layers,
  Check,
  ArrowRight,
} from 'lucide-react'

const FREE_STEPS = [
  {
    icon: UserRoundPlus,
    title: 'Create account',
    desc: 'Register your trading account through our exclusive partner link.',
  },
  {
    icon: CircleDollarSign,
    title: 'Fund balance',
    desc: 'A minimum of $50 in trading capital activates your access.',
  },
  {
    icon: BadgeCheck,
    title: 'Verify UID',
    desc: 'Send your UID to the support desk for instant verification.',
  },
]

const LICENSE_PERKS = [
  'Skip broker registration entirely',
  'Direct, unrestricted engine access',
  'One month full license, instant activation',
  'Priority support channel included',
]

export function CocoPricing() {
  return (
    <section id="pricing" className="coco-light coco-curve-top scroll-mt-24">
      <div className="mx-auto max-w-[1140px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <span className="coco-eyebrow">
          <Layers className="h-3 w-3" />
          Access paths
        </span>
        <h2 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[22ch] text-balance text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem]">
          Two ways in. Same engine.
        </h2>
        <p className="coco-muted mx-auto mt-4 max-w-[54ch] text-pretty text-sm sm:text-base">
          Earn free access through our partner broker, or take a direct license and skip the setup
          completely.
        </p>

        <div className="mx-auto mt-12 grid max-w-[980px] items-stretch gap-4 lg:grid-cols-2">
          {/* Partner access */}
          <div
            className="coco-card flex flex-col p-6 text-center sm:p-8"
            data-testid="pricing-free"
          >
            <span className="coco-mono mx-auto rounded-full border border-[#b9f3dd] bg-[#e6fff7] px-3 py-1 text-[10px] uppercase text-[#0f7a5a]">
              $0 partner
            </span>
            <h3 className="coco-sub mt-4 text-xl sm:text-2xl">Partner access</h3>
            <p className="coco-muted mt-2 text-sm">Three steps and the engine unlocks at no cost.</p>

            <ol className="mt-6 flex flex-1 flex-col gap-3">
              {FREE_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-[var(--hairline)] bg-white/70 p-4 text-left"
                >
                  <span className="coco-icon h-10 w-10 shrink-0">
                    <step.icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="coco-mono text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">
                      Step {i + 1}
                    </p>
                    <p className="coco-sub mt-0.5 text-[16px] sm:text-[17px]">{step.title}</p>
                    <p className="coco-muted mt-1 text-[13px] leading-relaxed sm:text-sm">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="https://market-qx.pro/sign-up/?lid=619650"
                target="_blank"
                rel="noopener noreferrer"
                className="coco-btn coco-btn-ghost w-full"
                data-testid="pricing-broker-cta"
              >
                <UserRoundPlus className="h-4 w-4" />
                Create account
              </a>
              <a
                href="https://t.me/Ayan_Dead"
                target="_blank"
                rel="noopener noreferrer"
                className="coco-btn w-full border border-[#dccdff] bg-[#ece4ff] text-[var(--iris)] hover:bg-[#e0d3ff]"
                data-testid="pricing-support-cta"
              >
                <Headset className="h-4 w-4" />
                Contact desk
              </a>
            </div>
          </div>

          {/* License */}
          <div
            className="coco-shade relative flex flex-col overflow-hidden rounded-[24px] p-6 text-center sm:p-8"
            data-testid="pricing-license"
          >
            <span className="coco-mono mx-auto rounded-full border border-white/18 bg-white/[0.08] px-3 py-1 text-[10px] uppercase text-white/75">
              instant access
            </span>
            <h3 className="coco-sub mt-4 text-xl text-white sm:text-2xl">Direct license</h3>
            <p className="mx-auto mt-2 max-w-[38ch] text-sm text-white/60">
              No broker, no waiting. One month of unrestricted engine access.
            </p>

            <div className="mt-6 flex items-end justify-center gap-2">
              <span className="coco-display text-[2.6rem] leading-none text-white sm:text-[3.4rem]">
                $99
              </span>
              <span className="coco-mono mb-1 text-[11px] uppercase text-white/50">/ month</span>
            </div>

            <ul className="mx-auto mt-6 flex flex-1 flex-col gap-3 text-left">
              {LICENSE_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="group flex items-center gap-3 rounded-[10px] border border-white/[0.09] bg-gradient-to-r from-white/[0.075] to-white/[0.025] px-4 py-3.5 text-[13px] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,background-color,transform] duration-300 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.09] sm:text-sm"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border border-[#c4a6ff]/25 bg-[#c4a6ff]/12 text-[#c4a6ff] transition-colors duration-300 group-hover:bg-[#c4a6ff]/20">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-snug">{perk}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://t.me/Ayan_Dead"
              target="_blank"
              rel="noopener noreferrer"
              className="coco-btn coco-btn-primary mt-6 w-full"
              data-testid="pricing-license-cta"
            >
              <KeyRound className="h-4 w-4" />
              Purchase License
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
