'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Support', href: 'https://t.me/Ayan_Dead', external: true },
]

export function SiteNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-3 z-50 px-3 sm:top-4 sm:px-6">
      <nav className="border-luxe surface-luxe mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-4 shadow-lg shadow-black/25 backdrop-blur-xl sm:px-6 lg:px-8">
        {/* Left: logo + name */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-border">
            <Image
              src="/sweetex-logo.jpg"
              alt="Sweetex AI logo"
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Sweetex <span className="text-shine">AI</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Button
            render={<Link href="/login" />}
            className="btn-luxe h-12 gap-2 rounded-xl px-7 text-base font-semibold"
          >
            <Brain className="icon-pulse-soft h-[18px] w-[18px]" />
            Get Sweetex AI
          </Button>
        </div>

        {/* Mobile: 3-line icon */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-luxe surface-luxe mx-auto mt-2 max-w-7xl rounded-2xl px-4 py-4 shadow-lg shadow-black/25 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button
              render={<Link href="/login" />}
              onClick={() => setOpen(false)}
              className="btn-luxe mt-2 h-11 w-full gap-2 rounded-xl text-sm font-semibold"
            >
              <Brain className="icon-pulse-soft h-4 w-4" />
              Get Sweetex AI
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
