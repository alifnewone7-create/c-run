'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  LayoutDashboard,
  ScanLine,
  ScanSearch,
  Telescope,
  Newspaper,
  Radio,
  Syringe,
  SlidersHorizontal,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  IdCard,
  Mail,
  Copy,
  Check,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { CocoBottomNav } from '@/components/coco/coco-bottom-nav'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'OTC Chart Analyzer', href: '/otc-chart-analyzer', icon: ScanLine },
  { label: 'Real Chart Analyzer', href: '/real-chart-analyzer', icon: ScanSearch },
  { label: 'Future Signals', href: '/future-signals', icon: Telescope },
  { label: 'News Signals', href: '/news-signals', icon: Newspaper },
  { label: 'Live Signals', href: '/live-signals', icon: Radio },
  { label: 'Coco Injector', href: '/injector', icon: Syringe },
  { label: 'Management', href: '/management', icon: SlidersHorizontal },
]

const navSections = [
  {
    heading: null,
    links: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Chart Analyzers',
    links: [
      { label: 'OTC Chart Analyzer', href: '/otc-chart-analyzer', icon: ScanLine },
      { label: 'Real Chart Analyzer', href: '/real-chart-analyzer', icon: ScanSearch },
    ],
  },
  {
    heading: 'Signal System',
    links: [
      { label: 'Live Signals', href: '/live-signals', icon: Radio },
      { label: 'Coco Injector', href: '/injector', icon: Syringe },
      { label: 'Future Signals', href: '/future-signals', icon: Telescope },
      { label: 'News Signals', href: '/news-signals', icon: Newspaper },
    ],
  },
  {
    heading: 'Management',
    links: [{ label: 'Management', href: '/management', icon: SlidersHorizontal }],
  },
]

export function TopNav({ bottomNav = true }: { bottomNav?: boolean } = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close overlays whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Lock body scroll and enable Escape-to-close while the profile modal is open
  useEffect(() => {
    if (!profileOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [profileOpen])

  // Lock body scroll and enable Escape-to-close while the logout confirmation is open
  useEffect(() => {
    if (!logoutConfirmOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLogoutConfirmOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [logoutConfirmOpen])

  const firstName = profile?.name?.split(' ')[0] || 'Trader'

  function requestLogout() {
    setLogoutConfirmOpen(true)
  }

  async function confirmLogout() {
    setLoggingOut(true)
    await logout()
    router.push('/login')
  }

  async function handleCopyEmail() {
    const email = profile?.email
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // Fallback for browsers/contexts without the async clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = email
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        document.execCommand('copy')
      } catch {
        // ignore
      }
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
    <header className="sticky top-0 z-50 hidden px-3 pt-3 sm:px-4 sm:pt-4 md:block">
      <div className="border-luxe surface-luxe mx-auto max-w-6xl rounded-2xl shadow-[0_10px_40px_-12px_oklch(0.5_0.2_285_/_0.45)] backdrop-blur-xl">
        <nav className="flex items-center justify-between gap-4 px-3 py-2.5 sm:px-5 sm:py-3">
          {/* Mobile: hamburger (left) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="btn-luxe-outline flex h-10 w-10 items-center justify-center rounded-xl md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo (center on mobile, left on desktop) */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 md:gap-3"
          >
            <Image
              src="/coco-ai.jpg"
              alt="Coco AI"
              width={36}
              height={36}
              className="hidden rounded-xl ring-1 ring-primary/30 md:block"
            />
            <span className="text-lg font-bold tracking-tight md:text-xl">
                    Coco <span className="text-shine">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 rounded-2xl border border-border/60 bg-input/20 p-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  aria-label={link.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                    active
                      ? 'btn-luxe'
                      : 'text-muted-foreground hover:bg-input/40 hover:text-foreground',
                  )}
                >
                  <link.icon
                    className={cn(
                      'h-[1.15rem] w-[1.15rem] shrink-0 transition-transform group-hover:scale-110',
                      active && 'text-primary-foreground',
                    )}
                  />
                  <span className="sr-only">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Profile (right) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2.5 rounded-2xl transition-all md:border md:border-border/60 md:bg-input/20 md:py-1 md:pl-1 md:pr-3 md:hover:bg-input/40"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-primary/40 transition-transform hover:scale-105 md:hover:scale-100">
                <Image
                  src="/coco-ai.jpg"
                  alt={`${firstName} profile`}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="hidden flex-col items-start leading-tight md:flex">
                <span className="max-w-[9rem] truncate text-sm font-semibold">
                  {firstName}
                </span>
                <span className="text-gradient text-[11px] font-bold uppercase tracking-wide">
                  {profile?.plan || 'free'}
                </span>
              </span>
            </button>

          </div>

          {/* Centered profile popup (rendered above everything via portal) */}
          {mounted &&
            profileOpen &&
            createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Your profile"
                className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-16 sm:items-center sm:pt-4"
              >
                <button
                  type="button"
                  aria-label="Close profile"
                  onClick={() => setProfileOpen(false)}
                  className="animate-in fade-in absolute inset-0 cursor-default bg-background/75 backdrop-blur-sm duration-200"
                />
                <div className="profile-card relative z-10 w-full max-w-md overflow-hidden rounded-3xl">
                  <div className="profile-card__header flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                        Coco AI account
                      </p>
                      <h2 className="mt-1 text-lg font-bold tracking-tight">
                        Profile details
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileOpen(false)}
                        aria-label="Close profile"
                        className="btn-luxe-outline flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      >
                        <X className="h-5 w-5" strokeWidth={2.25} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 p-5 sm:p-6">
                    <section className="profile-card__identity flex items-center gap-4 rounded-2xl p-4 sm:p-5">
                      <span className="profile-card__avatar relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                        <Image
                          src="/coco-ai.jpg"
                          alt={`${firstName} profile`}
                          width={96}
                          height={96}
                          className="h-full w-full rounded-[14px] border-2 border-accent object-cover"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                          {profile?.name || 'Trader'}
                        </p>
                        <span className="profile-card__status mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="text-[11px] font-semibold uppercase leading-none tracking-wide">
                            Active account
                          </span>
                        </span>
                      </div>
                    </section>

                    <div className="flex flex-col gap-3">
                      <section className="profile-card__detail flex min-w-0 items-center gap-3 rounded-2xl p-4">
                        <span className="profile-card__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Mail className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Email address
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold lowercase leading-snug">
                            {(profile?.email || '—').toLowerCase()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          aria-label={copied ? 'Email copied' : 'Copy email address'}
                          disabled={!profile?.email}
                          className="profile-card__copy flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-40"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </section>

                      <section className="profile-card__tier flex min-w-0 items-center gap-3 rounded-2xl p-4">
                        <span className="profile-card__tier-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <IdCard className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Account tier
                          </p>
                          <p className="mt-1 truncate text-sm font-bold capitalize text-foreground">
                            {profile?.plan || 'free'} plan
                          </p>
                        </div>
                      </section>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-5">
                      <p className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                        Signed in securely
                      </p>
                      <button
                        type="button"
                        onClick={requestLogout}
                        className="profile-card__logout flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold sm:w-auto"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </nav>
      </div>

      {/* Mobile left sidebar */}
      {menuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="animate-in fade-in fixed inset-0 z-40 cursor-default bg-background/60 backdrop-blur-sm duration-200"
          />
          <aside className="animate-in slide-in-from-left surface-luxe fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[82%] flex-col border-r border-border/60 shadow-[0_0_32px_-14px_oklch(0.5_0.2_285_/_0.3)] backdrop-blur-2xl duration-300">
            {/* Header with profile */}
            <div className="relative overflow-hidden border-b border-border/60 px-4 pb-4 pt-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/coco-ai.jpg"
                    alt="Coco AI"
                    width={38}
                    height={38}
                    className="rounded-xl ring-1 ring-primary/30"
                  />
                  <span className="text-lg font-bold tracking-tight">
              Coco <span className="text-shine">AI</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="btn-luxe-outline flex h-9 w-9 items-center justify-center rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Grouped nav sections */}
            <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
              {navSections.map((section, i) => (
                <div key={section.heading ?? `section-${i}`} className="flex flex-col gap-1.5">
                  {section.heading && (
                    <div className="flex items-center gap-2.5 px-2 pb-1 pt-1">
                      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                        {section.heading}
                      </p>
                      <span className="h-px flex-1 bg-gradient-to-r from-border/70 to-transparent" />
                    </div>
                  )}
                  {section.links.map((link) => {
                    const active = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                          active
                            ? 'btn-luxe no-sheen'
                            : 'text-muted-foreground hover:bg-input/30 hover:text-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                            active
                              ? 'bg-primary-foreground/15'
                              : 'bg-input/40 group-hover:bg-input/60',
                          )}
                        >
                          <link.icon className="h-[1.05rem] w-[1.05rem]" />
                        </span>
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>

            <div className="border-t border-border/60 p-3">
              <button
                type="button"
                onClick={requestLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Logout confirmation dialog */}
      {mounted &&
        logoutConfirmOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
          >
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => !loggingOut && setLogoutConfirmOpen(false)}
              className="animate-in fade-in absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm duration-200"
            />
            <div className="animate-in fade-in zoom-in-95 border-luxe surface-luxe relative z-10 w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-primary/25 duration-200">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/60 to-transparent" />
              <div className="flex flex-col items-center px-6 pb-6 pt-7 text-center sm:px-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
                  <LogOut className="h-7 w-7" />
                </span>
                <h2
                  id="logout-confirm-title"
                  className="mt-4 text-lg font-bold tracking-tight sm:text-xl"
                >
                  Log out of Coco AI?
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  You&apos;ll need to sign in again to access your dashboard and
                  tools.
                </p>

                <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmLogout}
                    disabled={loggingOut}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:flex-1"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? 'Logging out…' : 'Log out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoutConfirmOpen(false)}
                    disabled={loggingOut}
                    className="btn-luxe-outline flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60 sm:flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
    {bottomNav && <CocoBottomNav />}
    </>
  )
}
