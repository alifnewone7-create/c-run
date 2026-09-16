'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Engine', href: '#about' },
  { label: 'Compare', href: '#compare' },
  { label: 'How it works', href: '#how' },
  { label: 'Access', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Support', href: 'https://t.me/Ayan_Dead', external: true },
]

export function CocoNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-3 z-50 px-3 sm:top-5 sm:px-6" data-testid="coco-navbar">
      <nav className="coco-nav mx-auto flex h-16 max-w-[1200px] items-center justify-between rounded-3xl pl-4 pr-3 sm:pl-5 sm:pr-4">
        <a href="#top" className="flex items-center gap-2.5" data-testid="nav-brand">
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
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="coco-navlink"
              data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex">
          <Link href="/login" className="coco-btn coco-btn-primary" data-testid="nav-cta">
            Launch Coco AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          data-testid="nav-mobile-toggle"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          className="coco-nav mx-auto mt-2 max-w-[1200px] rounded-3xl p-3 md:hidden"
          data-testid="nav-mobile-menu"
        >
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="coco-btn coco-btn-primary mt-2 w-full"
              data-testid="nav-mobile-cta"
            >
              Launch Coco AI
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
