'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  CalendarDays,
  Brain,
  Flame,
  Gauge,
  CalendarX,
  Clock,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  Minus,
  X,
  ArrowBigUpDash,
  ArrowBigDownDash,
  Activity,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Sparkles,
  Lock,
  KeyRound,
  Newspaper,
} from 'lucide-react'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { flagUrl } from '@/lib/markets'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { useUpgradeGate } from '@/components/upgrade-gate'

type NewsImpact = 'high' | 'medium' | 'low' | 'holiday'

type NewsEvent = {
  id: string
  title: string
  currency: string
  date: string
  impact: NewsImpact
  forecast: string
  previous: string
  direction: 'UP' | 'DOWN' | 'NEUTRAL'
  confidence: number
  reasoning: string
  forecastNum: number | null
  previousNum: number | null
}

type NewsResponse = { events: NewsEvent[]; updatedAt: string }

type Section = 'events' | 'fundamental'

const fetcher = async ([url, token]: [string, string]): Promise<NewsResponse> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || 'Failed to load events') as Error & {
      code?: string
      status?: number
    }
    err.code = body.code
    err.status = res.status
    throw err
  }
  return res.json()
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Compact time without AM/PM — used in list rows and stat chips.
function fmtTimeShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDay(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

/* ── Single currency flag chip ── */
function Flag({ currency, size = 28 }: { currency: string; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-background"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={flagUrl(currency)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </span>
  )
}

const impactMeta: Record<NewsImpact, { label: string; dot: string; chip: string }> = {
  high: {
    label: 'High',
    dot: 'bg-down',
    chip: 'border-down/40 bg-down/15 text-down',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-gold',
    chip: 'border-gold/40 bg-gold/15 text-gold',
  },
  low: {
    label: 'Low',
    dot: 'bg-accent',
    chip: 'border-accent/40 bg-accent/15 text-accent',
  },
  holiday: {
    label: 'Holiday',
    dot: 'bg-muted-foreground',
    chip: 'border-border bg-input/40 text-muted-foreground',
  },
}

export function NewsSignalsView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell
          testid="news-signals-page"
          eyebrow="News signals"
          icon={Newspaper}
          title="Trade the calendar, not the noise."
          desc="Today's economic releases with their impact, plus an AI fundamental read so you know which windows to avoid and which to attack."
          width="max-w-4xl"
        >
          <NewsStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function NewsStudio() {
  const [section, setSection] = useState<Section>('events')
  const [active, setActive] = useState<NewsEvent | null>(null)
  const { getToken, hasAccess, loading: authLoading } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  // Resolve a fresh ID token for the authorized news request.
  useEffect(() => {
    let cancelled = false
    getToken().then((t) => {
      if (!cancelled) setToken(t)
    })
    return () => {
      cancelled = true
    }
  }, [getToken])

  const { data, error, isLoading, mutate } = useSWR<NewsResponse>(
    // Only fetch once a token exists AND the tier allows access.
    token && hasAccess ? ['/api/news', token] : null,
    fetcher,
    // Auto-refresh every minute while the user is on the page.
    { revalidateOnFocus: false, refreshInterval: 60_000 },
  )

  // Filter to the user's LOCAL "today" so the day matches their device timezone
  // (the feed returns the whole week; the server runs in UTC).
  const events = useMemo(() => {
    const all = data?.events ?? []
    const now = new Date()
    return all.filter((e) => {
      const d = new Date(e.date)
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
  }, [data])

  const fundamentals = useMemo(
    () => events.filter((e) => e.impact === 'high' || e.impact === 'medium'),
    [events],
  )

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Section switch */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-input/20 p-1">
        <SectionTab
          active={section === 'events'}
          onClick={() => setSection('events')}
          icon={CalendarDays}
          label="Today's Events"
        />
        <SectionTab
          active={section === 'fundamental'}
          onClick={() => setSection('fundamental')}
          icon={Brain}
          label="Fundamental"
        />
      </div>

      {/* Free tier: pages are viewable but content is locked behind upgrade. */}
      {!authLoading && !hasAccess && <NewsLockedState />}

      {hasAccess && (isLoading || (!data && !error)) && <LoadingState />}
      {hasAccess && error && !isLoading && (
        <ErrorState onRetry={() => mutate()} message={String(error.message || error)} />
      )}

      {hasAccess && !isLoading && !error && data && (
        <>
          {section === 'events' ? (
            <EventsSection events={events} updatedAt={data?.updatedAt} onOpen={setActive} />
          ) : (
            <FundamentalSection events={fundamentals} onOpen={setActive} />
          )}
        </>
      )}

      {active && <EventDetail event={active} onClose={() => setActive(null)} />}
    </div>
  )
}

/* ─────────────── Today's Events ─────────────── */

function EventsSection({
  events,
  updatedAt,
  onOpen,
}: {
  events: NewsEvent[]
  updatedAt?: string
  onOpen: (e: NewsEvent) => void
}) {
  if (events.length === 0) return <EmptyState label="No economic events scheduled for today." />

  const highCount = events.filter((e) => e.impact === 'high').length

  return (
    <section className="flex flex-col gap-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          icon={CalendarDays}
          label="Events"
          value={String(events.length)}
          tone="accent"
          iconClassName="icon-tick"
        />
        <StatCard
          icon={Flame}
          label="High Impact"
          value={String(highCount)}
          tone="down"
          iconClassName="icon-fire"
        />
        <StatCard
          icon={Clock}
          label="Updated"
          value={updatedAt ? fmtTimeShort(updatedAt) : '--:--'}
          tone="up"
          iconClassName="clock-hands"
        />
      </div>

      <div className="flex items-center gap-2 px-1">
        <span className="status-dot" />
        <p className="mono-label">{updatedAt ? fmtDay(updatedAt) : 'Today'}</p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {events.map((ev, i) => (
          <li
            key={ev.id}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${Math.min(i * 40, 400)}ms`, animationFillMode: 'both' }}
          >
            <EventRow event={ev} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function EventRow({ event, onOpen }: { event: NewsEvent; onOpen: (e: NewsEvent) => void }) {
  const meta = impactMeta[event.impact]
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className="border-luxe surface-luxe group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3.5 text-left transition-all hover:brightness-110 sm:gap-4 sm:p-4"
    >
      {/* time column */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-sm font-bold tabular-nums">{fmtTimeShort(event.date)}</span>
      </div>

      <span className="h-10 w-px shrink-0 bg-border" />

      {/* flag + title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Flag currency={event.currency} size={30} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
              {event.currency}
            </span>
            <span className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', meta.chip)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold">{event.title}</p>
        </div>
      </div>

      {/* direction hint + chevron */}
      <div className="flex shrink-0 items-center gap-2">
        <DirBadge direction={event.direction} compact />
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </button>
  )
}

/* ─────────────── Fundamental ─────────────── */

function FundamentalSection({
  events,
  onOpen,
}: {
  events: NewsEvent[]
  onOpen: (e: NewsEvent) => void
}) {
  if (events.length === 0)
    return <EmptyState label="No high or medium impact events to analyze today." />

  const up = events.filter((e) => e.direction === 'UP').length
  const down = events.filter((e) => e.direction === 'DOWN').length

  return (
    <section className="flex flex-col gap-4">
      {/* Bias overview */}
      <div className="border-luxe surface-luxe card-corner-glow relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="icon-pulse-soft h-4 w-4 text-accent" />
            <p className="mono-label">AI Fundamental Read</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              icon={ArrowBigUpDash}
              label="Bullish"
              value={String(up)}
              tone="up"
              iconClassName="dir-arrow-up"
            />
            <StatCard
              icon={ArrowBigDownDash}
              label="Bearish"
              value={String(down)}
              tone="down"
              iconClassName="dir-arrow-down"
            />
            <StatCard
              icon={Gauge}
              label="Signals"
              value={String(events.length)}
              tone="accent"
              iconClassName="gauge-needle"
            />
          </div>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
            Each release is scored by comparing its forecast against the previous figure and the
            indicator type, then mapped to a likely direction for the currency around the release
            time.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {events.map((ev, i) => (
          <li
            key={ev.id}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, animationFillMode: 'both' }}
          >
            <FundamentalCard event={ev} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FundamentalCard({ event, onOpen }: { event: NewsEvent; onOpen: (e: NewsEvent) => void }) {
  const isUp = event.direction === 'UP'
  const isDown = event.direction === 'DOWN'
  const tone = isUp ? 'up' : isDown ? 'down' : 'muted'

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className={cn(
        'signal-card group relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all hover:brightness-110',
        isUp && 'signal-card-up',
        isDown && 'signal-card-down',
        !isUp && !isDown && 'border-border bg-input/20',
      )}
    >
      <span className="signal-card-scan" aria-hidden />
      <span className="signal-card-grid" aria-hidden />

      <div className="relative flex items-center gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center gap-0.5">
          <span className="mono-label">{fmtTimeShort(event.date)}</span>
        </div>
        <Flag currency={event.currency} size={28} />
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
            {event.currency} · {impactMeta[event.impact].label}
          </span>
          <p className="truncate text-sm font-semibold">{event.title}</p>
        </div>
        <DirBadge direction={event.direction} />
      </div>

      {/* forecast vs previous + confidence bar */}
      <div className="relative flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 text-xs">
          <MiniStat label="Forecast" value={event.forecast || '—'} />
          <MiniStat label="Previous" value={event.previous || '—'} />
        </div>
        {event.confidence > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-input/60">
              <span
                className={cn(
                  'block h-full rounded-full transition-all',
                  tone === 'up' && 'bg-up',
                  tone === 'down' && 'bg-down',
                  tone === 'muted' && 'bg-accent',
                )}
                style={{ width: `${event.confidence}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold tabular-nums">{event.confidence}%</span>
          </div>
        )}
      </div>
    </button>
  )
}

/* ─────────────── Detail modal ─────────────── */

function EventDetail({ event, onClose }: { event: NewsEvent; onClose: () => void }) {
  const meta = impactMeta[event.impact]
  const isUp = event.direction === 'UP'
  const isDown = event.direction === 'DOWN'

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-background/70 backdrop-blur-sm duration-200"
      />
      <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10 w-full max-w-lg duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="border-luxe surface-luxe card-corner-glow relative m-3 overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="relative z-10 flex flex-col gap-5">
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Flag currency={event.currency} size={38} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wide text-accent">
                      {event.currency}
                    </span>
                    <span className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', meta.chip)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                      {meta.label} Impact
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {fmtDay(event.date)} · {fmtTime(event.date)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="btn-luxe-outline flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-balance text-lg font-bold leading-snug">{event.title}</h2>

            {/* figures */}
            <div className="grid grid-cols-2 gap-2.5">
              <FigureCard label="Forecast" value={event.forecast || '—'} icon={Activity} />
              <FigureCard label="Previous" value={event.previous || '—'} icon={Clock} />
            </div>

            {/* prediction */}
            <div
              className={cn(
                'signal-card relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4',
                isUp && 'signal-card-up text-up',
                isDown && 'signal-card-down text-down',
                !isUp && !isDown && 'border-accent/30 bg-accent/10 text-accent',
              )}
            >
              <span className="signal-card-scan" aria-hidden />
              <div
                className={cn(
                  'signal-badge relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl',
                  isUp && 'signal-badge-up',
                  isDown && 'signal-badge-down',
                )}
              >
                <span className="signal-badge-glow" aria-hidden />
                <span className="signal-badge-ring" aria-hidden />
                {isUp ? (
                  <ChevronsUp className="dir-arrow-up relative h-8 w-8" strokeWidth={2.75} />
                ) : isDown ? (
                  <ChevronsDown className="dir-arrow-down relative h-8 w-8" strokeWidth={2.75} />
                ) : (
                  <Minus className="relative h-8 w-8" strokeWidth={2.75} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Predicted bias · {event.currency}
                </span>
                <p className="font-mono text-2xl font-extrabold uppercase leading-none tracking-tight">
                  {event.direction}
                </p>
                {event.confidence > 0 && (
                  <p className="mt-1 text-xs font-semibold">Confidence {event.confidence}%</p>
                )}
              </div>
            </div>

            {/* reasoning */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-input/20 p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <p className="mono-label">Fundamental logic</p>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {event.reasoning}
              </p>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              Educational estimate based on forecast vs previous data. Actual releases can move
              against expectations — always manage your risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Small building blocks ─────────────── */

function SectionTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
        active ? 'btn-luxe' : 'text-muted-foreground hover:bg-input/40 hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4', active && 'text-primary-foreground')} />
      {label}
    </button>
  )
}

function DirBadge({ direction, compact }: { direction: NewsEvent['direction']; compact?: boolean }) {
  const isUp = direction === 'UP'
  const isDown = direction === 'DOWN'
  return (
    <span
      className={cn(
        'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
        isUp && 'bg-up/15 text-up',
        isDown && 'bg-down/15 text-down',
        !isUp && !isDown && 'bg-muted/40 text-muted-foreground',
      )}
    >
      {isUp ? (
        <ChevronsUp className="dir-arrow-up h-3.5 w-3.5" />
      ) : isDown ? (
        <ChevronsDown className="dir-arrow-down h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
      {!compact && direction}
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'accent' | 'up' | 'down'
  iconClassName?: string
}) {
  return (
    <div className="border-luxe surface-luxe relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl px-2 py-3.5 text-center">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          tone === 'accent' && 'bg-accent/15 text-accent',
          tone === 'up' && 'bg-up/15 text-up',
          tone === 'down' && 'bg-down/15 text-down',
        )}
      >
        <Icon className={cn('h-4 w-4', iconClassName)} />
      </span>
      <p className="font-mono text-2xl font-extrabold leading-none tabular-nums">{value}</p>
      <p className="text-[10px] font-medium uppercase leading-none tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold tabular-nums">{value}</span>
    </div>
  )
}

function FigureCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-input/20 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        <Icon className="h-4 w-4 text-accent" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return <div className="h-[76px] animate-pulse rounded-2xl border border-border/60 bg-input/20" />
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2.5">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-input/10 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading today&apos;s economic calendar…</p>
      </div>
    </div>
  )
}

function NewsLockedState() {
  const { open } = useUpgradeGate()
  return (
    <div className="border-luxe surface-luxe relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl p-8 text-center">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Lock className="h-7 w-7" />
      </span>
      <div className="relative">
        <h3 className="text-lg font-bold">News Signals is locked</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Your Free account can browse the app, but live news signals require a paid
          plan. Upgrade to unlock the economic calendar and AI fundamental reads.
        </p>
      </div>
      <Button
        onClick={() => open({ reason: 'locked' })}
        className="btn-luxe relative h-11 gap-2 rounded-2xl px-5 font-bold"
      >
        <KeyRound className="h-4 w-4" />
        Upgrade to unlock
      </Button>
    </div>
  )
}

function ErrorState({ onRetry, message }: { onRetry: () => void; message: string }) {
  return (
    <div className="border-luxe surface-luxe flex flex-col items-center gap-4 rounded-3xl p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-down/15">
        <AlertTriangle className="h-7 w-7 text-down" />
      </span>
      <div>
        <h3 className="text-lg font-bold">Couldn&apos;t load events</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button onClick={onRetry} className="btn-luxe h-11 gap-2 rounded-2xl px-5 font-bold">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border-luxe surface-luxe card-corner-glow relative flex min-h-[40vh] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl p-8 text-center">
      <span className="btn-luxe flex h-14 w-14 items-center justify-center rounded-2xl">
        <CalendarX className="icon-float h-7 w-7 text-primary-foreground" />
      </span>
      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{label}</p>
    </div>
  )
}
