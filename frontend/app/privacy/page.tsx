import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react'
import { CocoFooter } from '@/components/coco/coco-footer'
import { GlyphTelegram } from '@/components/coco/coco-glyphs'

export const metadata: Metadata = {
  title: 'Privacy Policy — Coco AI',
  description:
    'Learn how Coco AI collects, uses, and protects your personal information when you use our trading signals and chart analysis tools.',
}

const LAST_UPDATED = 'July 12, 2026'

const SECTIONS = [
  {
    heading: '1. Introduction',
    body: [
      'Coco AI ("Coco AI", "we", "us", or "our") provides an algorithmic trading assistant that delivers automated, data-driven trading signals and chart-analysis tools. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
      'By creating an account or using Coco AI, you agree to the practices described in this policy. If you do not agree, please discontinue use of the service.',
    ],
  },
  {
    heading: '2. Information We Collect',
    body: [
      'Account information: when you register, we collect your name, email address, and authentication credentials, which are managed securely through our authentication provider.',
      'Usage data: we record how you interact with our tools — such as which analyzers or signal pages you use and your daily generation counts — to enforce plan limits and improve the service.',
      'Technical data: we may collect device, browser, and approximate location information, along with cookies and similar technologies needed to keep you signed in and secure your session.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    body: [
      'To create and manage your account, authenticate you, and maintain your subscription tier (Free, Basic, Standard, Premium, or Admin).',
      'To operate core features, including generating trading signals, applying daily usage limits, and delivering chart analysis.',
      'To protect the platform against fraud, abuse, and unauthorized access, and to comply with legal obligations.',
      'To communicate important updates about your account, plan, or the service.',
    ],
  },
  {
    heading: '4. Trading Data & Signals',
    body: [
      'Coco AI provides tools and signals for informational purposes only. We do not execute trades on your behalf and we do not have access to your brokerage funds. Any trading you perform through third-party brokers is entirely your responsibility.',
      'Signal outputs and analysis results are generated based on market data and are not guarantees of future performance.',
    ],
  },
  {
    heading: '5. Third-Party Services',
    body: [
      'We rely on trusted third parties to operate Coco AI, including authentication and hosting providers. These providers process data only as needed to deliver their services.',
      'Some links (for example, broker sign-up links and our Telegram support channel) direct you to external platforms that operate under their own privacy policies. We are not responsible for the practices of those third parties.',
    ],
  },
  {
    heading: '6. Cookies & Sessions',
    body: [
      'We use cookies and local storage to keep you signed in, remember preferences, and secure your session. You can control cookies through your browser settings, but disabling them may limit access to certain features.',
    ],
  },
  {
    heading: '7. Data Security',
    body: [
      'We apply industry-standard safeguards — including encryption in transit and secure credential handling — to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '8. Data Retention',
    body: [
      'We retain your account and usage data for as long as your account is active or as needed to provide the service. You may request deletion of your account, after which we will remove or anonymize your personal data except where retention is required by law.',
    ],
  },
  {
    heading: '9. Your Rights',
    body: [
      'Depending on your location, you may have the right to access, correct, export, or delete your personal information, and to object to or restrict certain processing. To exercise these rights, contact us using the details below.',
    ],
  },
  {
    heading: '10. Children’s Privacy',
    body: [
      'Coco AI is not intended for anyone under the age of 18. We do not knowingly collect personal information from children. If you believe a minor has provided us information, please contact us so we can remove it.',
    ],
  },
  {
    heading: '11. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date above. Continued use of Coco AI after changes take effect constitutes acceptance of the revised policy.',
    ],
  },
  {
    heading: '12. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your data is handled, reach out to us on Telegram at @Ayan_Dead.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div id="top" className="coco min-h-dvh bg-[#0b0618]" data-testid="privacy-page">
      <div className="coco-dark relative overflow-hidden">
        <header className="sticky top-3 z-50 px-3 sm:top-5 sm:px-6">
          <nav className="coco-nav mx-auto flex h-16 max-w-[1000px] items-center justify-between rounded-3xl pl-4 pr-3 sm:pl-5 sm:pr-4">
            <Link href="/" className="flex items-center gap-2.5" data-testid="privacy-brand">
              <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/20">
                <Image
                  src="/coco-ai.jpg"
                  alt="Coco AI logo"
                  fill
                  className="object-cover"
                  sizes="36px"
                  priority
                />
              </span>
              <span className="coco-sub text-[17px] text-white">
                Coco <span className="coco-accent">AI</span>
              </span>
            </Link>
            <Link
              href="/"
              className="coco-btn coco-btn-ghost h-10 px-4 text-sm"
              data-testid="privacy-back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-[900px] px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-14">
          <span className="coco-eyebrow">
            <ShieldCheck className="h-3 w-3" />
            Privacy policy
          </span>
          <h1 className="coco-display coco-title-gradient mx-auto mt-5 max-w-[22ch] text-balance text-[1.9rem] sm:text-[2.6rem] lg:text-[3rem]">
            Your data stays yours.
          </h1>
          <p className="mx-auto mt-4 max-w-[56ch] text-pretty text-sm leading-relaxed text-white/62 sm:text-base">
            This policy describes how Coco AI handles your information when you use our trading
            signals, chart analyzers and related tools.
          </p>
          <p className="coco-mono mt-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-white/55">
            <Lock className="h-3 w-3" />
            Last updated · {LAST_UPDATED}
          </p>
        </div>
      </div>

      <main className="coco-light coco-curve-top">
        <div className="mx-auto max-w-[900px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-4">
            {SECTIONS.map((section) => (
              <section
                key={section.heading}
                className="coco-card p-6 text-left sm:p-8"
                data-testid={`privacy-section-${section.heading.split('.')[0]}`}
              >
                <h2 className="coco-sub text-[17px] sm:text-[19px]">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="coco-muted text-pretty text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="coco-muted text-sm">Still have a question about your data?</p>
            <a
              href="https://t.me/Ayan_Dead"
              target="_blank"
              rel="noopener noreferrer"
              className="coco-btn coco-btn-ghost"
              data-testid="privacy-support-cta"
            >
              <GlyphTelegram className="h-4 w-4" />
              Message support
            </a>
          </div>
        </div>
      </main>

      <CocoFooter />
    </div>
  )
}
