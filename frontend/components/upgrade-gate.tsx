'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import {
  Lock,
  KeyRound,
  Headset,
  X,
  Gauge,
  Gem,
  Crown,
  Check,
  UserPlus,
  Wallet,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FEATURE_LABEL, type FeatureKey } from '@/lib/tiers'

type GateReason = 'locked' | 'limit'

type GatePayload = {
  reason: GateReason
  feature?: FeatureKey
  message?: string
}

type UpgradeGateContextValue = {
  /** Open the upgrade modal with a reason. */
  open: (payload: GatePayload) => void
}

const UpgradeGateContext = createContext<UpgradeGateContextValue | undefined>(
  undefined,
)

const FREE_STEPS = [
  {
    icon: UserPlus,
    title: 'Create Account',
    desc: 'Register through our exclusive partner link.',
  },
  {
    icon: Wallet,
    title: 'Deposit Capital',
    desc: 'Minimum $50 to activate your balance.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify UID',
    desc: 'Send your UID to support for instant access.',
  },
]

const LICENSE_PERKS = [
  'Skip broker registration entirely',
  'Direct, unrestricted access',
  '1-month full license, instant activation',
  'Priority support included',
]

export function UpgradeGateProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<GatePayload | null>(null)
  const [showPlans, setShowPlans] = useState(false)

  const open = useCallback((next: GatePayload) => {
    setShowPlans(false)
    setPayload(next)
  }, [])
  const close = useCallback(() => {
    setPayload(null)
    setShowPlans(false)
  }, [])

  const isLimit = payload?.reason === 'limit'
  const featureLabel = payload?.feature ? FEATURE_LABEL[payload.feature] : null

  return (
    <UpgradeGateContext.Provider value={{ open }}>
      {children}

      {payload && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {isLimit ? (
            <div className="border-luxe surface-luxe relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] shadow-2xl shadow-primary/30">
              {/* ambient color grading */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />

              {/* top bar keeps the close button safely inside the card */}
              <div className="relative z-30 flex justify-end px-4 pt-4">
                <button
                  type="button"
                  onClick={close}
                  className="btn-luxe-outline flex h-9 w-9 items-center justify-center rounded-xl"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative z-10 flex flex-col items-center px-6 pb-7 pt-1 text-center sm:px-8">
                {/* icon medallion */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-accent/20 ring-1 ring-primary/40">
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-background/60 text-primary ring-1 ring-primary/30">
                    <Gauge className="h-7 w-7" />
                  </div>
                </div>

                <h2
                  id="upgrade-title"
                  className="mt-5 text-balance text-2xl font-bold tracking-tight sm:text-[1.7rem]"
                >
                  Daily limit reached
                </h2>

                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {`You've used all of your ${
                    featureLabel ?? 'tool'
                  } generations for today.`}
                </p>

                {/* reset time chip */}
                <div className="mt-5 flex w-full items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.07] p-3.5 text-left">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Clock className="h-4 w-4" />
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Resets every morning after{' '}
                    <span className="font-semibold text-foreground">
                      6:00 AM
                    </span>{' '}
                    Bangladesh Standard Time{' '}
                    <span className="whitespace-nowrap">(UTC+06:00)</span>.
                  </p>
                </div>

                <Button
                  nativeButton={false}
                  render={
                    <a
                      href="https://t.me/Ayan_Dead"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="btn-luxe mt-6 h-12 w-full gap-2 rounded-xl text-sm font-semibold sm:text-base"
                >
                  <Crown className="h-[18px] w-[18px]" />
                  I want to upgrade my account
                </Button>
              </div>
            </div>
          ) : !showPlans ? (
            <div className="border-luxe surface-luxe relative z-10 w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-primary/25">
              {/* subtle gold hairline at top */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Header band */}
              <div className="relative overflow-hidden border-b border-border/60 px-5 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6">
                <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
                <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/30 sm:h-14 sm:w-14">
                      <Lock className="lock-anim h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h2
                      id="upgrade-title"
                      className="min-w-0 text-balance text-lg font-bold leading-snug tracking-tight sm:text-2xl"
                    >
                      Unlock the full{' '}
                      <span className="text-shine">experience</span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={close}
                    className="btn-luxe-outline flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="relative px-6 pb-6 pt-5 sm:px-8">
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {payload.message ??
                    `Your Free account can browse every page, but generating results with ${
                      featureLabel ?? 'the tools'
                    } is reserved for members. Choose a plan to start winning.`}
                </p>

                <ul className="mt-5 flex flex-col gap-3">
                  {[
                    'Unlimited AI signal generation',
                    'Priority support & instant activation',
                    'Full access to every premium tool',
                  ].map((perk) => (
                    <li key={perk} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-foreground/90">{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2.5">
                  <Button
                    onClick={() => setShowPlans(true)}
                    className="btn-luxe h-12 w-full gap-2 rounded-xl text-sm font-semibold sm:text-base"
                  >
                    <Gem className="h-[18px] w-[18px]" />
                    View plans
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a
                        href="https://t.me/Ayan_Dead"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="h-11 w-full gap-2 rounded-xl"
                  >
                    <Headset className="h-[18px] w-[18px]" />
                    Contact Admin
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-luxe surface-luxe relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] p-6 shadow-2xl shadow-primary/25 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/40 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center">
                <span className="border-luxe surface-luxe inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  Choose your access
                </span>
                <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                  Two ways to start with{' '}
                  <span className="text-gradient">Sweetex AI</span>
                </h2>
                <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
                  Get free access through our partner broker, or buy a direct
                  license and skip the setup.
                </p>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {/* Free Access */}
                <div className="border-luxe surface-luxe relative flex flex-col rounded-3xl p-5 shadow-xl shadow-black/20 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Free Access</h3>
                    <span className="rounded-full bg-[var(--up)]/15 px-3 py-1 text-xs font-semibold text-[var(--up)]">
                      $0 / partner
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Follow these 3 simple steps to unlock Sweetex AI for free.
                  </p>

                  <ol className="mt-5 flex flex-1 flex-col gap-3">
                    {FREE_STEPS.map((step, i) => (
                      <li
                        key={step.title}
                        className="flex gap-3 rounded-2xl border border-border bg-background/40 p-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <step.icon className="h-4 w-4 text-foreground" />
                            <p className="text-sm font-semibold leading-tight">
                              {step.title}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-5 flex flex-col gap-3">
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <a
                          href="https://market-qx.pro/sign-up/?lid=619650"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="btn-luxe-outline h-11 w-full gap-2 rounded-xl border-transparent text-sm font-semibold"
                    >
                      <UserPlus className="h-[18px] w-[18px]" />
                      Create Quotex Account
                    </Button>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <a
                          href="https://t.me/Ayan_Dead"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="group h-11 w-full gap-2 rounded-xl border border-accent/40 bg-accent/10 text-sm font-semibold text-accent transition-shadow hover:bg-accent/15"
                    >
                      <Headset className="h-[18px] w-[18px]" />
                      Contact Admin
                    </Button>
                  </div>
                </div>

                {/* Buy License */}
                <div className="surface-luxe relative flex flex-col overflow-hidden rounded-3xl border border-primary/40 p-5 shadow-2xl shadow-primary/20 ring-1 ring-primary/20 sm:p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

                  <div className="relative flex items-center justify-between">
                    <h3 className="text-lg font-bold">Buy License</h3>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      Direct access
                    </span>
                  </div>
                  <p className="relative mt-2 text-sm text-muted-foreground">
                    Skip broker registration. Purchase a direct, unrestricted
                    1-month license immediately.
                  </p>

                  <div className="relative mt-5 flex items-end gap-1">
                    <span className="text-gradient text-4xl font-extrabold tracking-tight">
                      $99
                    </span>
                    <span className="mb-1 text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>

                  <ul className="relative mt-5 flex flex-1 flex-col gap-3">
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
                    nativeButton={false}
                    render={
                      <a
                        href="https://t.me/Ayan_Dead"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="btn-luxe relative mt-5 h-11 w-full gap-2 rounded-xl text-sm font-semibold"
                  >
                    <KeyRound className="h-[18px] w-[18px]" />
                    Purchase License
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPlans(false)}
                className="mx-auto mt-5 block text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </UpgradeGateContext.Provider>
  )
}

export function useUpgradeGate() {
  const ctx = useContext(UpgradeGateContext)
  if (!ctx) {
    throw new Error('useUpgradeGate must be used within an UpgradeGateProvider')
  }
  return ctx
}
