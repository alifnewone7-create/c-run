import { Check, UserPlus, Wallet, ShieldCheck, Layers, KeyRound, Headset } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FREE_STEPS = [
  {
    icon: UserPlus,
    title: 'Create Account',
    desc: 'Use our exclusive partner link to register your trading account.',
  },
  {
    icon: Wallet,
    title: 'Deposit Capital',
    desc: 'Minimum $50 for your trading balance to get started.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify UID',
    desc: 'Send your UID to our support team for instant verification.',
  },
]

const LICENSE_PERKS = [
  'Skip broker registration entirely',
  'Direct, unrestricted access',
  '1-month full license, instant activation',
  'Priority support included',
]

export function PricingTiers() {
  return (
    <section id="pricing" className="relative scroll-mt-20 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="border-luxe surface-luxe inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Layers className="icon-float h-3.5 w-3.5 text-foreground" />
            Choose your access
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Two ways to start with{' '}
            <span className="text-gradient">Sweetex AI</span>
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Get free access through our partner broker, or buy a direct license and skip the setup.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Free Access */}
          <div className="border-luxe surface-luxe relative flex flex-col rounded-3xl p-6 shadow-xl shadow-black/20 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Free Access</h3>
              <span className="rounded-full bg-[var(--up)]/15 px-3 py-1 text-xs font-semibold text-[var(--up)]">
                $0 / partner
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow these 3 simple steps to unlock Sweetex AI for free.
            </p>

            <ol className="mt-6 flex flex-1 flex-col gap-4">
              {FREE_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-background/40 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <step.icon className="icon-float h-4 w-4 text-foreground" />
                      <p className="font-semibold leading-tight">{step.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                render={
                  <a
                    href="https://market-qx.pro/sign-up/?lid=619650"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="btn-luxe-outline h-12 w-full gap-2 rounded-xl border-transparent text-base font-semibold"
              >
                <UserPlus className="icon-float h-[18px] w-[18px]" />
                Create Quotex Account
              </Button>

              <Button
                variant="outline"
                render={
                  <a
                    href="https://t.me/Ayan_Dead"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="group h-12 w-full gap-2 rounded-xl border border-accent/40 bg-accent/10 text-base font-semibold text-accent shadow-[0_0_10px_-7px_var(--accent)] transition-shadow hover:bg-accent/15 hover:shadow-[0_0_14px_-6px_var(--accent)]"
              >
                <Headset className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110 motion-safe:animate-[float-line_2.4s_ease-in-out_infinite]" />
                Contact Admin
              </Button>
            </div>
          </div>

          {/* Buy License */}
          <div className="surface-luxe relative flex flex-col overflow-hidden rounded-3xl border border-primary/40 p-6 shadow-2xl shadow-primary/20 ring-1 ring-primary/20 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <h3 className="text-xl font-bold">Buy License</h3>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                Direct access
              </span>
            </div>
            <p className="relative mt-2 text-sm text-muted-foreground">
              Skip broker registration. Purchase a direct, unrestricted 1-month license
              immediately.
            </p>

            <div className="relative mt-6 flex items-end gap-1">
              <span className="text-gradient text-4xl font-extrabold tracking-tight">$99</span>
              <span className="mb-1 text-sm text-muted-foreground">/ month</span>
            </div>

            <ul className="relative mt-6 flex flex-1 flex-col gap-3">
              {LICENSE_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground/90">{perk}</span>
                </li>
              ))}
            </ul>

            <Button
              render={
                <a
                  href="https://t.me/Ayan_Dead"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="btn-luxe mt-6 h-12 w-full gap-2 rounded-xl text-base font-semibold"
            >
              <KeyRound className="icon-pulse-soft h-[18px] w-[18px]" />
              Purchase License
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
