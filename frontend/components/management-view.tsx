'use client'

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  SlidersHorizontal,
  Wallet,
  Percent,
  Target,
  ShieldAlert,
  Repeat,
  Check,
  X,
  Trophy,
  CircleDollarSign,
  Coins,
  Layers,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CocoPageShell } from '@/components/coco/coco-page-shell'
import { AuthGuard } from '@/components/auth-guard'
import { useAuth } from '@/components/auth-provider'
import { useUpgradeGate } from '@/components/upgrade-gate'
import {
  simulate,
  normalizeResults,
  fmtMoney,
  MIN_TRADE,
  type TradeConfig,
  type TradeResult,
} from '@/lib/mtg'

const STORAGE_KEY = 'sweetex:management:session'

/** A generated + saved trade sheet session. */
interface Session {
  config: TradeConfig
  results: TradeResult[]
}

function num(v: string) {
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function loadSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.config || !Array.isArray(parsed.results)) return null
    return parsed
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  if (typeof window === 'undefined') return
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function ManagementView() {
  return (
    <AuthGuard>
      {() => (
        <CocoPageShell
          testid="management-page"
          eyebrow="Money management"
          icon={SlidersHorizontal}
          title="Size every trade with discipline."
          desc="Feed in your capital, payout and risk, and get a clean trade sheet that tells you exactly how much to stake on each entry."
          width="max-w-4xl"
        >
          <ManagementStudio />
        </CocoPageShell>
      )}
    </AuthGuard>
  )
}

function ManagementStudio() {
  // Access gate: Free tier can view the page but not generate a plan.
  const { hasAccess } = useAuth()
  const { open: openUpgrade } = useUpgradeGate()
  // Live configuration inputs — empty by default (no pre-filled amounts).
  const [initialCapital, setInitialCapital] = useState('')
  const [averagePayout, setAveragePayout] = useState('')
  const [profitTarget, setProfitTarget] = useState('')
  const [riskPerTrade, setRiskPerTrade] = useState('')
  const [mtg, setMtg] = useState(false)
  const [tab, setTab] = useState<'management' | 'sheet'>('management')

  // The generated + persisted sheet. Null until the user generates one.
  const [session, setSession] = useState<Session | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Restore the last generated sheet from localStorage on mount.
  useEffect(() => {
    setSession(loadSession())
    setHydrated(true)
  }, [])

  // Persist the session whenever it changes (after hydration).
  useEffect(() => {
    if (hydrated) saveSession(session)
  }, [session, hydrated])

  const config = useMemo<TradeConfig>(
    () => ({
      initialCapital: num(initialCapital),
      averagePayout: num(averagePayout),
      profitTarget: num(profitTarget),
      riskPerTrade: num(riskPerTrade),
      mtg,
    }),
    [initialCapital, averagePayout, profitTarget, riskPerTrade, mtg],
  )

  // Initial capital must be greater than 10 for a sheet to be generated.
  const capitalTooLow = config.initialCapital > 0 && config.initialCapital < 10

  // Lightweight preview for the config hints (no results needed).
  const preview = useMemo(() => simulate(config, []), [config])

  // The risk-per-trade dollar amount must be at least the $1 minimum
  // (78% payout of $1 = $0.78), and the profit target must be at least $1.
  const riskTooLow =
    config.riskPerTrade > 0 && preview.rawRiskAmount < MIN_TRADE - 1e-9
  const profitTargetTooLow =
    config.profitTarget > 0 && preview.profitTargetAmount < MIN_TRADE - 1e-9

  const valid =
    config.initialCapital >= 10 &&
    config.averagePayout >= 78 &&
    config.profitTarget > 0 &&
    config.riskPerTrade > 0 &&
    !riskTooLow &&
    !profitTargetTooLow

  // The active sheet is derived only from the saved session, never live input.
  const sheet = useMemo(
    () => (session ? simulate(session.config, session.results) : null),
    [session],
  )

  const generate = () => {
    if (!valid) return
    // Free tier is blocked from generating — prompt an upgrade instead.
    if (!hasAccess) {
      openUpgrade({ reason: 'locked' })
      return
    }
    setSession({ config, results: normalizeResults(config, []) })
    setTab('sheet')
  }

  const setResultAt = (i: number, r: TradeResult) => {
    // Free tier cannot interact with a (previously saved) sheet either.
    if (!hasAccess) {
      openUpgrade({ reason: 'locked' })
      return
    }
    setSession((prev) => {
      if (!prev) return prev
      const next = prev.results.slice()
      next[i] = r
      return { ...prev, results: normalizeResults(prev.config, next) }
    })
  }

  // Clear all marked results back to a fresh, all-pending plan.
  const resetSheet = () =>
    setSession((prev) =>
      prev ? { ...prev, results: normalizeResults(prev.config, []) } : prev,
    )

  const progress =
    sheet && sheet.profitTargetAmount > 0
      ? Math.max(0, Math.min(1, sheet.finalProfit / sheet.profitTargetAmount))
      : 0

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Tabs */}
      <div className="grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-input/25 p-1.5">
        <TabButton
          icon={SlidersHorizontal}
          label="Management"
          active={tab === 'management'}
          onClick={() => setTab('management')}
        />
        <TabButton
          icon={Layers}
          label="Sheet"
          active={tab === 'sheet'}
          onClick={() => setTab('sheet')}
          badge={sheet ? sheet.rows.length : undefined}
        />
      </div>

      {tab === 'management' ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-2 duration-500">
          {/* Config */}
          <section className="border-luxe surface-luxe card-corner-glow relative flex flex-col gap-4 overflow-hidden rounded-3xl p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <p className="mono-label">Configuration</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                icon={Wallet}
                iconClass="icon-count"
                label="Initial Capital"
                prefix="$"
                value={initialCapital}
                onChange={setInitialCapital}
                tone="accent"
                note={
                  capitalTooLow
                    ? 'Initial capital must be greater than 10 to generate a sheet.'
                    : undefined
                }
                noteTone="down"
              />
              <Field
                icon={Percent}
                iconClass="icon-meter"
                label="Average Payout"
                suffix="%"
                value={averagePayout}
                onChange={(v) => setAveragePayout(Number(v) > 100 ? '100' : v)}
                integerOnly
                tone="up"
                badge={payoutLevel(config.averagePayout)}
                note={
                  config.averagePayout > 0 && config.averagePayout < 78
                    ? 'Payout is below 78%. Trading in markets with a payout above 78% gives noticeably better returns.'
                    : undefined
                }
              />
              <Field
                icon={WavingFlag}
                label="Profit Target"
                suffix="%"
                value={profitTarget}
                onChange={setProfitTarget}
                tone="gold"
                badge={targetLevel(config.profitTarget)}
                hint={
                  valid
                    ? `${config.profitTarget}% of ${fmtMoney(config.initialCapital)} = ${fmtMoney(preview.profitTargetAmount)}`
                    : undefined
                }
                note={
                  profitTargetTooLow
                    ? `${config.profitTarget}% of ${fmtMoney(config.initialCapital)} = ${fmtMoney(preview.profitTargetAmount)} — the profit target must be at least ${fmtMoney(MIN_TRADE)}.`
                    : undefined
                }
                noteTone="down"
              />
              <Field
                icon={ShieldAlert}
                iconClass="icon-guard"
                label="Risk Per Trade"
                suffix="%"
                value={riskPerTrade}
                onChange={setRiskPerTrade}
                integerOnly
                tone="down"
                badge={riskLevel(config.riskPerTrade)}
                hint={
                  valid
                    ? `${config.riskPerTrade}% of ${fmtMoney(config.initialCapital)} = ${fmtMoney(preview.rawRiskAmount)}`
                    : undefined
                }
                note={
                  riskTooLow
                    ? `${config.riskPerTrade}% of ${fmtMoney(config.initialCapital)} = ${fmtMoney(preview.rawRiskAmount)} — each trade must be at least ${fmtMoney(MIN_TRADE)}.`
                    : undefined
                }
                noteTone="down"
              />
            </div>

            <MtgToggle value={mtg} onChange={setMtg} />
          </section>

          {/* Generate */}
          <button
            type="button"
            disabled={!valid}
            onClick={generate}
            className="btn-luxe flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Layers className="h-4 w-4" />
            Generate Sheet
          </button>

          {!valid ? (
            <p className="text-center text-xs text-muted-foreground">
              Fill in all fields to generate your trade sheet.
            </p>
          ) : sheet ? (
            <p className="text-center text-xs text-muted-foreground">
              A saved sheet exists — generating will replace it.
            </p>
          ) : null}
        </div>
      ) : !hydrated ? null : !sheet ? (
        <EmptyState onGoToConfig={() => setTab('management')} />
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-500">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatCard
              icon={Target}
              iconClass="icon-pulse-soft"
              label="Target"
              value={fmtMoney(sheet.profitTargetAmount)}
              tone="gold"
            />
            <StatCard
              icon={ShieldAlert}
              iconClass="icon-pulse-soft"
              label="Per Trade"
              value={fmtMoney(sheet.baseRiskAmount)}
              tone="down"
            />
            <StatCard
              icon={CircleDollarSign}
              iconClass="icon-count"
              label="Per Win"
              value={fmtMoney(sheet.perWinProfit)}
              tone="up"
            />
            <StatCard
              icon={Layers}
              iconClass="icon-tick"
              label="Trades"
              value={`${sheet.tradesDone}/${sheet.rows.length}`}
              tone="accent"
            />
          </div>

          <ProgressPanel sheet={sheet} progress={progress} onReset={resetSheet} />

          <TradeSheet sheet={sheet} mtg={session!.config.mtg} onSet={setResultAt} />
        </div>
      )}
    </div>
  )
}

/* ── Config field ── */
type Tone = 'accent' | 'up' | 'down' | 'gold'

const toneMap: Record<Tone, string> = {
  accent: 'bg-accent/15 text-accent',
  up: 'bg-up/15 text-up',
  down: 'bg-down/15 text-down',
  gold: 'bg-gold/15 text-gold',
}

/** Subtle single-hue gradients for icon chips (diagonal, low → high opacity). */
const toneGradient: Record<Tone, string> = {
  accent: 'bg-gradient-to-br from-accent/30 via-accent/15 to-accent/5 text-accent',
  up: 'bg-gradient-to-br from-up/30 via-up/15 to-up/5 text-up',
  down: 'bg-gradient-to-br from-down/30 via-down/15 to-down/5 text-down',
  gold: 'bg-gradient-to-br from-gold/30 via-gold/15 to-gold/5 text-gold',
}

interface Level {
  label: string
  tone: Tone
}

/** Risk-per-trade classification (higher = riskier). */
function riskLevel(v: number): Level | null {
  if (!(v > 0)) return null
  if (v <= 20) return { label: 'Low Risk', tone: 'up' }
  if (v <= 50) return { label: 'Medium Risk', tone: 'gold' }
  if (v <= 70) return { label: 'High Risk', tone: 'down' }
  return { label: 'Very High Risk', tone: 'down' }
}

/** Profit-target aggressiveness (higher = more aggressive). */
function targetLevel(v: number): Level | null {
  if (!(v > 0)) return null
  if (v <= 20) return { label: 'Conservative', tone: 'up' }
  if (v <= 50) return { label: 'Moderate', tone: 'gold' }
  if (v <= 70) return { label: 'Aggressive', tone: 'down' }
  return { label: 'Very Aggressive', tone: 'down' }
}

/** Payout quality badge — 78%+ is the healthy threshold. */
function payoutLevel(v: number): Level | null {
  if (!(v > 0)) return null
  return v >= 78 ? { label: 'Good Payout', tone: 'up' } : { label: 'Low Payout', tone: 'down' }
}

/**
 * Flag icon whose pole (danda) stays perfectly still while only the
 * cloth (potaka) flutters — the pole is a separate static line and the
 * cloth path animates via the `.flag-cloth` class.
 */
function WavingFlag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* static pole */}
      <line x1="5" y1="22" x2="5" y2="3" />
      {/* waving cloth */}
      <path
        className="flag-cloth"
        d="M5 4c1.8-1.1 3.6-1.1 5.4 0s3.6 1.1 5.4 0 3.6-1.1 5.2 0v8c-1.6-1.1-3.4-1.1-5.2 0s-3.6 1.1-5.4 0-3.6-1.1-5.4 0V4z"
      />
    </svg>
  )
}

function Field({
  icon: Icon,
  iconClass,
  label,
  value,
  onChange,
  prefix,
  suffix,
  tone,
  hint,
  badge,
  note,
  noteTone = 'gold',
  integerOnly,
}: {
  icon: ComponentType<{ className?: string }>
  iconClass?: string
  label: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  tone: Tone
  hint?: string
  badge?: Level | null
  note?: string | null
  noteTone?: 'gold' | 'down'
  integerOnly?: boolean
}) {
  return (
    <label className="group relative flex cursor-text flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-input/25 p-4 transition-all focus-within:border-accent/60 focus-within:bg-input/40 focus-within:ring-1 focus-within:ring-accent/30">
      {/* Header: icon + label, with optional classification badge */}
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-inset ring-border/30',
              toneGradient[tone],
            )}
          >
            <Icon className={cn('h-4 w-4', iconClass)} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </span>
        {badge && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ring-border/30',
              toneMap[badge.tone],
            )}
          >
            {badge.label}
          </span>
        )}
      </span>

      {/* Value input */}
      <span className="flex items-baseline gap-1 border-b border-border/40 pb-2.5">
        {prefix && (
          <span className="font-mono text-lg font-bold text-muted-foreground">{prefix}</span>
        )}
        <input
          type="text"
          inputMode={integerOnly ? 'numeric' : 'decimal'}
          value={value}
          onChange={(e) => {
            const raw = e.target.value
            if (integerOnly) {
              // Only digits allowed.
              onChange(raw.replace(/[^\d]/g, ''))
            } else {
              // Only digits and a single dot allowed.
              let cleaned = raw.replace(/[^\d.]/g, '')
              const firstDot = cleaned.indexOf('.')
              if (firstDot !== -1) {
                cleaned =
                  cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
              }
              onChange(cleaned)
            }
          }}
          className="w-full min-w-0 bg-transparent font-mono text-2xl font-extrabold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/40"
          placeholder="0"
        />
        {suffix && (
          <span className="font-mono text-lg font-bold text-muted-foreground">{suffix}</span>
        )}
      </span>

      {/* Derived hint + contextual note */}
      {(hint || note) && (
        <span className="flex flex-col gap-1.5">
          {hint && (
            <span className="font-mono text-[10px] leading-tight text-muted-foreground">
              {hint}
            </span>
          )}
          {note && (
            <span
              className={cn(
                'flex items-start gap-1.5 text-[10px] leading-relaxed',
                noteTone === 'down' ? 'text-down' : 'text-gold',
              )}
            >
              {noteTone === 'down' ? (
                <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
              ) : (
                <Lightbulb className="mt-px h-3 w-3 shrink-0" />
              )}
              {note}
            </span>
          )}
        </span>
      )}
    </label>
  )
}

/* ── MTG toggle ── */
function MtgToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-input/25 p-3">
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
            value ? 'bg-accent/20 text-accent' : 'bg-input/60 text-muted-foreground',
          )}
        >
          <Repeat className={cn('h-4 w-4', value && 'icon-spin-slow')} />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold">Martingale (MTG)</span>
          <span className="text-[11px] text-muted-foreground">Double the stake after a loss</span>
        </span>
      </span>
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-background/60 p-1">
        {(['No', 'Yes'] as const).map((opt) => {
          const on = (opt === 'Yes') === value
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === 'Yes')}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all',
                on
                  ? opt === 'Yes'
                    ? 'bg-accent text-accent-foreground shadow'
                    : 'bg-input text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Summary stat card ── */
function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  iconClass?: string
  label: string
  value: string
  tone: Tone
}) {
  return (
    <div className="border-luxe surface-luxe group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl px-2 py-4 text-center transition-transform duration-300 hover:-translate-y-0.5">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/30 transition-transform duration-300 group-hover:scale-110',
          toneGradient[tone],
        )}
      >
        <Icon className={cn('h-4 w-4', iconClass)} />
      </span>
      <p className="font-mono text-lg font-extrabold leading-none tabular-nums sm:text-xl">{value}</p>
      <p className="text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

/* ── Progress panel ── */
function ProgressPanel({
  sheet,
  progress,
  onReset,
}: {
  sheet: ReturnType<typeof simulate>
  progress: number
  onReset: () => void
}) {
  const pct = Math.round(progress * 100)
  const up = sheet.finalProfit >= 0
  return (
    <section className="border-luxe surface-luxe card-corner-glow relative flex flex-col gap-4 overflow-hidden rounded-3xl p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/30 bg-gradient-to-br',
              up ? 'from-up/30 via-up/15 to-up/5 text-up' : 'from-down/30 via-down/15 to-down/5 text-down',
            )}
          >
            <Coins className={cn('h-5 w-5', up ? 'icon-count' : 'icon-guard')} />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Net Profit
            </span>
            <span
              className={cn(
                'font-mono text-2xl font-extrabold leading-tight tabular-nums',
                up ? 'text-up' : 'text-down',
              )}
            >
              {fmtMoney(sheet.finalProfit)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Target
          </span>
          <span className="font-mono text-lg font-extrabold leading-tight tabular-nums text-gold sm:text-xl">
            {fmtMoney(sheet.profitTargetAmount)}
          </span>
        </div>
      </div>

      {/* Progress bar with animated shimmer */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-input/60 ring-1 ring-inset ring-border/40">
          <div
            className={cn(
              'progress-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out',
              up
                ? 'from-up via-up to-gold shadow-[0_0_12px_-2px] shadow-up/60'
                : 'from-down via-down to-gold shadow-[0_0_12px_-2px] shadow-down/60',
            )}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono font-bold tabular-nums text-foreground">{pct}%</span>
          <span>to profit target</span>
        </div>
      </div>

      {/* Counts + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-lg bg-up/10 px-2 py-1 text-up">
            <Check className="h-3.5 w-3.5" />
            <span className="font-mono font-bold tabular-nums">{sheet.wins}</span>
            <span className="opacity-70">W</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-down/10 px-2 py-1 text-down">
            <X className="h-3.5 w-3.5" />
            <span className="font-mono font-bold tabular-nums">{sheet.losses}</span>
            <span className="opacity-70">L</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-input/50 px-2 py-1 text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <span className="font-mono font-bold tabular-nums">{sheet.pendingCount}</span>
            <span className="opacity-70">planned</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {sheet.tradesDone > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="btn-luxe-outline rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Trade sheet ── */
function TradeSheet({
  sheet,
  mtg,
  onSet,
}: {
  sheet: ReturnType<typeof simulate>
  mtg: boolean
  onSet: (i: number, r: TradeResult) => void
}) {
  const [showCelebration, setShowCelebration] = useState(false)

  // Pop the celebration modal the moment the profit target is reached.
  useEffect(() => {
    if (sheet.targetHit) setShowCelebration(true)
    else setShowCelebration(false)
  }, [sheet.targetHit])

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent icon-tick" />
          <p className="mono-label">Trade Sheet</p>
        </div>
        <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
          {sheet.tradesDone}/{sheet.rows.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {sheet.rows.map((row, i) => (
          <li
            key={row.index}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${Math.min(i * 45, 450)}ms`, animationFillMode: 'both' }}
          >
            <TradeCard row={row} mtg={mtg} onSet={(r) => onSet(i, r)} />
          </li>
        ))}
      </ul>

      {sheet.targetHit && showCelebration && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profit target reached"
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowCelebration(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Popup card */}
          <div className="border-luxe surface-luxe animate-in zoom-in-95 slide-in-from-bottom-2 relative z-10 flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl p-7 text-center duration-300">
            {/* Animated gradient trophy */}
            <span className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-up/40 to-gold/30 opacity-75" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-up via-gold to-accent shadow-[0_0_28px_-4px] shadow-up/60">
                <Trophy className="icon-float h-9 w-9 text-primary-foreground" />
              </span>
            </span>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground text-balance">
                Profit Target Reached
              </h2>
              <p className="text-sm text-muted-foreground text-pretty">
                {sheet.wins} wins
                {sheet.losses > 0 ? ` · ${sheet.losses} losses recovered` : ''} ·{' '}
                <span className="font-bold text-up">{fmtMoney(sheet.finalProfit)}</span> of{' '}
                {fmtMoney(sheet.profitTargetAmount)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="btn-luxe w-full rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function TradeCard({
  row,
  mtg,
  onSet,
}: {
  row: ReturnType<typeof simulate>['rows'][number]
  mtg: boolean
  onSet: (r: TradeResult) => void
}) {
  const pending = row.pending
  const win = !pending && (row.result === 'win' || row.result === 'mtg')
  const loss = !pending && (row.result === 'loss' || row.result === 'loss-mtg')
  const isMtgResult = row.result === 'mtg'
  const isLossMtg = row.result === 'loss-mtg'
  const [lossMenu, setLossMenu] = useState(false)
  return (
    <div
      className={cn(
        'border-luxe surface-luxe group relative flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5 sm:gap-4 sm:p-3.5',
        // Allow the loss menu to escape the card when open; otherwise clip decorations.
        lossMenu ? 'z-30 overflow-visible' : 'overflow-hidden',
        pending && 'border-dashed border-border/60',
        win && 'signal-card-up',
        loss && 'signal-card-down',
      )}
    >
      {/* index + stake */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1 sm:w-16">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors',
            pending && 'bg-muted/50 text-muted-foreground',
            win && 'bg-up/15 text-up',
            loss && 'bg-down/15 text-down',
          )}
        >
          {row.index}
        </span>
        <span
          className={cn(
            'font-mono text-sm font-extrabold tabular-nums',
            pending && 'text-muted-foreground',
          )}
        >
          {fmtMoney(row.amount)}
        </span>
        {row.isMtg && (
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
              isLossMtg
                ? 'border-down/40 bg-down/15 text-down'
                : 'border-accent/40 bg-accent/15 text-accent',
            )}
          >
            <Repeat className="h-2.5 w-2.5" />
            MTG
          </span>
        )}
      </div>

      <span className="hidden h-11 w-px shrink-0 bg-border sm:block" />

      {/* pnl + cumulative */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'font-mono text-base font-extrabold tabular-nums',
            pending && 'text-muted-foreground',
            win && 'text-up',
            loss && 'text-down',
          )}
        >
          {pending ? '~' : row.pnl >= 0 ? '+' : ''}
          {fmtMoney(row.pnl)}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{pending ? 'Planned' : 'Balance'}</span>
          <span
            className={cn(
              'font-mono font-bold tabular-nums',
              pending
                ? 'text-muted-foreground'
                : row.cumulative >= 0
                  ? 'text-up'
                  : 'text-down',
            )}
          >
            {fmtMoney(row.cumulative)}
          </span>
        </span>
      </div>

      {/* win / loss / mtg toggle */}
      <div
        className={cn(
          'relative grid shrink-0 gap-1 rounded-xl border border-border/60 bg-background/50 p-1',
          mtg ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        <button
          type="button"
          onClick={() => {
            setLossMenu(false)
            onSet('win')
          }}
          aria-label={`Mark trade ${row.index} as win`}
          className={cn(
            'flex h-8 w-9 items-center justify-center rounded-lg transition-all sm:w-10',
            win && !isMtgResult
              ? 'bg-up text-background shadow'
              : 'text-muted-foreground hover:bg-up/10 hover:text-up',
          )}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (mtg) {
              setLossMenu((v) => !v)
            } else {
              onSet('loss')
            }
          }}
          aria-label={`Mark trade ${row.index} as loss`}
          aria-expanded={mtg ? lossMenu : undefined}
          className={cn(
            'flex h-8 w-9 items-center justify-center rounded-lg transition-all sm:w-10',
            loss ? 'bg-down text-background shadow' : 'text-muted-foreground hover:bg-down/10 hover:text-down',
          )}
        >
          <X className="h-4 w-4" />
        </button>
        {mtg && (
          <button
            type="button"
            onClick={() => {
              setLossMenu(false)
              onSet('mtg')
            }}
            aria-label={`Mark trade ${row.index} as MTG recovery profit`}
            className={cn(
              'flex h-8 w-9 items-center justify-center rounded-lg transition-all sm:w-10',
              isMtgResult
                ? 'bg-accent text-accent-foreground shadow'
                : 'text-muted-foreground hover:bg-accent/10 hover:text-accent',
            )}
          >
            <Repeat className={cn('h-4 w-4', isMtgResult && 'icon-spin-slow')} />
          </button>
        )}

        {mtg && lossMenu && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close loss options"
              onClick={() => setLossMenu(false)}
            />
            <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-1 absolute bottom-full right-0 z-50 mb-2 flex w-48 flex-col gap-1 rounded-xl border border-border/60 bg-popover p-1.5 shadow-xl">
              <LossOption
                active={row.result === 'loss'}
                label="Normal Loss"
                amount={-row.amount}
                onClick={() => {
                  setLossMenu(false)
                  onSet('loss')
                }}
              />
              <LossOption
                active={isLossMtg}
                label="MTG Loss"
                amount={-(row.amount * 3)}
                mtg
                onClick={() => {
                  setLossMenu(false)
                  onSet('loss-mtg')
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Loss option (Normal / MTG) ─�� */
function LossOption({
  active,
  label,
  amount,
  mtg,
  onClick,
}: {
  active: boolean
  label: string
  amount: number
  mtg?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all',
        active ? 'bg-down/15 ring-1 ring-down/40' : 'hover:bg-input/50',
      )}
    >
      <span className="flex items-center gap-2">
        {mtg ? (
          <Repeat className="h-3.5 w-3.5 text-down" />
        ) : (
          <X className="h-3.5 w-3.5 text-down" />
        )}
        <span className="text-xs font-semibold">{label}</span>
      </span>
      <span className="font-mono text-xs font-bold tabular-nums text-down">{fmtMoney(amount)}</span>
    </button>
  )
}

/* ── Tab button ── */
function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all sm:text-sm',
        active
          ? 'btn-luxe text-primary-foreground'
          : 'text-muted-foreground hover:bg-input/40 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
          active && 'text-primary-foreground',
        )}
      />
      {label}
      {badge !== undefined && (
        <span
          className={cn(
            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
            active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-accent/15 text-accent',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/* ── Empty state ── */
function EmptyState({ onGoToConfig }: { onGoToConfig: () => void }) {
  return (
    <section className="border-luxe surface-luxe relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-input/60 text-muted-foreground">
        <SlidersHorizontal className="h-6 w-6 icon-slide" />
      </span>
      <p className="text-sm font-semibold">No sheet generated yet</p>
      <p className="max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
        Enter your capital, payout, profit target and risk per trade in the Management tab to
        generate a compounding trade sheet.
      </p>
      <button
        type="button"
        onClick={onGoToConfig}
        className="btn-luxe-outline mt-1 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Go to Management
      </button>
    </section>
  )
}
