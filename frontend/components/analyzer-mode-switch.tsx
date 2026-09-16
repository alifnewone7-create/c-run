'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, X } from 'lucide-react'
import { GlyphOtcPrism, GlyphRealPulse } from '@/components/analyzer-glyphs'
import {
  BROKERS,
  readStoredBroker,
  storeBroker,
  type Broker,
  type BrokerId,
} from '@/lib/brokers'
import { cn } from '@/lib/utils'

type Mode = 'otc' | 'real'

type Glyph = ({ className }: { className?: string }) => JSX.Element

const TABS: { mode: Mode; label: string; href: string; icon: Glyph }[] = [
  { mode: 'otc', label: 'OTC', href: '/otc-chart-analyzer', icon: GlyphOtcPrism },
  { mode: 'real', label: 'Real', href: '/real-chart-analyzer', icon: GlyphRealPulse },
]

export function AnalyzerModeSwitch({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [broker, setBroker] = useState<Broker | null>(null)
  const [picker, setPicker] = useState(false)

  useEffect(() => {
    setBroker(readStoredBroker())
    const sync = () => setBroker(readStoredBroker())
    window.addEventListener('coco:broker-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('coco:broker-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Prefetch the sibling route so switching feels instant.
  useEffect(() => {
    TABS.forEach((t) => router.prefetch?.(t.href))
  }, [router])

  function pick(id: BrokerId) {
    storeBroker(id)
    setPicker(false)
  }

  return (
    <div
      className="flex flex-row items-center justify-between gap-3"
      data-testid="analyzer-mode-switch"
    >
      <div className="coco-seg order-2 sm:order-1" role="tablist" aria-label="Analyzer mode">
        {TABS.map((tab) => {
          const active = tab.mode === mode
          return (
            <button
              key={tab.mode}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (!active) router.push(tab.href)
              }}
              className={cn('coco-seg-item', active && 'is-active')}
              data-testid={`analyzer-tab-${tab.mode}`}
            >
              <tab.icon className="h-[17px] w-[17px]" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setPicker(true)}
        className="coco-broker-chip order-1 sm:order-2"
        data-testid="analyzer-broker-chip"
      >
        <span className="coco-broker-chip-logo">
          {broker ? (
            <Image src={broker.logo} alt={broker.name} width={20} height={20} />
          ) : (
            <Building2 className="h-[15px] w-[15px] text-[#6d3bff]" />
          )}
        </span>
        <span className="min-w-0 text-left">
          <span className="coco-broker-chip-label">Broker</span>
          <span className="coco-broker-chip-name">{broker ? broker.name : 'Select'}</span>
        </span>
      </button>

      {picker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close broker picker"
            onClick={() => setPicker(false)}
            className="absolute inset-0 cursor-default bg-[#07041a]/80"
          />
          <div className="coco-broker-modal relative z-10 w-full max-w-[420px]">
            <div className="flex items-center justify-between gap-3 px-5 pt-4">
              <p className="coco-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                Choose your broker
              </p>
              <button
                type="button"
                onClick={() => setPicker(false)}
                aria-label="Close broker picker"
                className="coco-sheet-close"
                data-testid="broker-picker-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="coco-arc" data-testid="broker-arc-modal">
              {BROKERS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => pick(b.id)}
                  className="coco-arc-card"
                  style={
                    {
                      '--lift': `${b.lift}px`,
                      '--tilt': `${b.tilt}deg`,
                      '--accent': b.accent,
                    } as React.CSSProperties
                  }
                  data-testid={`broker-modal-${b.id}`}
                >
                  <span className="coco-arc-logo">
                    <Image src={b.logo} alt={b.name} width={34} height={34} />
                  </span>
                  <span className="coco-arc-name">{b.name}</span>
                </button>
              ))}
            </div>

            <p className="px-6 pb-5 text-center text-[11.5px] leading-relaxed text-white/45">
              The selected broker is shown on both the OTC and Real analyzer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
