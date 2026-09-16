'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import {
  ShieldCheck,
  LogOut,
  Users,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  RefreshCw,
  Infinity as InfinityIcon,
  Menu,
  X,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
  KeyRound,
  Plus,
  Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FEATURES,
  FEATURE_LABEL,
  TIER_LABEL,
  TIER_ORDER,
  TIER_DAILY_LIMIT,
  type FeatureKey,
  type Tier,
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

type UserRow = {
  uid: string
  name: string
  email: string
  tier: Tier
  createdAt: number
  usageToday: Record<FeatureKey, number>
}

type UsersResponse = { users: UserRow[]; day: string }

const fetcher = async (url: string): Promise<UsersResponse> => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to load users')
  }
  return res.json()
}

const TIER_BADGE: Record<Tier, string> = {
  free: 'bg-input/40 text-muted-foreground',
  basic: 'bg-accent/15 text-accent',
  standard: 'bg-[var(--gold)]/15 text-[var(--gold)]',
  premium: 'bg-primary/15 text-primary',
  admin: 'bg-up/15 text-up',
}

const SHORT_LABEL: Record<FeatureKey, string> = {
  'otc-chart-analyzer': 'OTC',
  'real-chart-analyzer': 'Real',
  'future-signals': 'Future',
  'live-signals': 'Live',
}

type View = 'tiers' | 'users' | 'apikeys'

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    '/api/admin/users',
    fetcher,
    // Near-live: refetch every 5s so tier + usage changes appear quickly.
    { refreshInterval: 5000, revalidateOnFocus: true },
  )
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('tiers')
  const [navOpen, setNavOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const users = data?.users ?? []
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  const counts = useMemo(() => {
    const c: Record<Tier, number> = {
      free: 0,
      basic: 0,
      standard: 0,
      premium: 0,
      admin: 0,
    }
    for (const u of users) c[u.tier] += 1
    return c
  }, [users])

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // proceed to clear local state regardless
    }
    onLogout()
  }

  const navItems: { key: View; label: string; icon: typeof Users }[] = [
    { key: 'tiers', label: 'Set account tier', icon: SlidersHorizontal },
    { key: 'users', label: 'Registered users', icon: Users },
    { key: 'apikeys', label: 'API key', icon: KeyRound },
  ]

  function goto(v: View) {
    setView(v)
    setNavOpen(false)
  }

  return (
    <main className="coco coco-dark relative flex min-h-dvh">
      {/* Mobile backdrop */}
      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#140a33]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
              <Image
                src="/coco-profile.png"
                alt="Coco AI logo"
                fill
                className="object-cover"
                sizes="40px"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">
                Coco <span className="text-shine">AI</span>
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                Admin Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className="btn-luxe-outline flex h-8 w-8 items-center justify-center rounded-lg lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1.5 p-3">
          {navItems.map((item) => {
            const active = view === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goto(item.key)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
                    : 'text-muted-foreground hover:bg-input/30 hover:text-foreground',
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
                {item.key === 'users' && (
                  <span className="ml-auto rounded-full bg-input/50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
                    {users.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border/60 p-3">
          <Button
            onClick={() => setConfirmLogout(true)}
            variant="outline"
            className="btn-luxe-outline h-11 w-full justify-start gap-2 rounded-xl border-transparent px-3.5 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#120a2c]/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="btn-luxe-outline flex h-10 w-10 items-center justify-center rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-border">
              <Image
                src="/coco-profile.png"
                alt="Coco AI logo"
                fill
                className="object-cover"
                sizes="32px"
              />
            </span>
            <span className="text-base font-bold tracking-tight">
              Coco <span className="text-shine">AI</span>
            </span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {view === 'tiers' ? (
            <div className="flex flex-col gap-6">
              <PageHeading
                icon={ShieldCheck}
                title="Set account tier"
                subtitle="Assign plans and review how many members are on each tier."
              />

              {/* Overview counts */}
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {TIER_ORDER.map((t) => (
                  <div
                    key={t}
                    className="border-luxe surface-luxe flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center"
                  >
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        TIER_BADGE[t],
                      )}
                    >
                      {TIER_LABEL[t]}
                    </span>
                    <p className="font-mono text-2xl font-extrabold tabular-nums">
                      {counts[t]}
                    </p>
                  </div>
                ))}
              </section>

              <TierSetter onDone={() => mutate()} />
            </div>
          ) : view === 'apikeys' ? (
            <div className="flex flex-col gap-6">
              <PageHeading
                icon={KeyRound}
                title="API key"
                subtitle="Add multiple Groq API keys. When one key's quota runs out, the next one is used automatically."
              />
              <GroqKeysPanel />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <PageHeading
                icon={Users}
                title="Registered users"
                subtitle="Tap a member's tier to change it, or remove the account."
              />

              <UsersView
                users={filtered}
                total={users.length}
                query={query}
                setQuery={setQuery}
                isLoading={isLoading}
                error={error}
                onRefresh={() => mutate()}
              />
            </div>
          )}
        </div>
      </div>

      {confirmLogout && (
        <LogoutDialog
          loading={loggingOut}
          onCancel={() => setConfirmLogout(false)}
          onConfirm={logout}
        />
      )}
    </main>
  )
}

function LogoutDialog({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="border-luxe surface-luxe relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl shadow-black/40">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-down/15 text-down">
          <LogOut className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold tracking-tight">Sign out?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll need to enter your credentials again to access the portal.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            className="btn-luxe-outline h-11 flex-1 rounded-xl font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="h-11 flex-1 gap-2 rounded-xl bg-down font-semibold text-background hover:bg-down/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {loading ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PageHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Users
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function UsersView({
  users,
  total,
  query,
  setQuery,
  isLoading,
  error,
  onRefresh,
}: {
  users: UserRow[]
  total: number
  query: string
  setQuery: (v: string) => void
  isLoading: boolean
  error: unknown
  onRefresh: () => void
}) {
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const hasError = Boolean(error)

  return (
    <section className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-input/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {total} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="h-10 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            className="btn-luxe-outline flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm">Loading users…</p>
        </div>
      )}

      {hasError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="h-7 w-7 text-down" />
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message
              ? String((error as Error).message)
              : 'Failed to load users'}
          </p>
          <Button
            onClick={onRefresh}
            className="btn-luxe h-10 gap-2 rounded-xl px-4 font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {users.map((u) => (
            <UserCard
              key={u.uid}
              user={u}
              onChanged={onRefresh}
              onRequestDelete={() => setDeleteTarget(u)}
            />
          ))}

          {users.length === 0 && (
            <div className="border-luxe surface-luxe col-span-full rounded-2xl px-4 py-12 text-center text-sm text-muted-foreground">
              No users match your search.
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null)
            onRefresh()
          }}
        />
      )}
    </section>
  )
}

function UserCard({
  user,
  onChanged,
  onRequestDelete,
}: {
  user: UserRow
  onChanged: () => void
  onRequestDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function changeTier(tier: Tier) {
    setMenuOpen(false)
    if (tier === user.tier) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, tier }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to update tier.')
      }
      onChanged()
    } catch {
      // Silent; SWR refetch keeps state consistent.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-luxe surface-luxe relative flex flex-col gap-4 rounded-2xl p-4 sm:p-5">
      {/* Top: identity + delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestDelete}
          aria-label={`Delete ${user.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-down/30 bg-down/10 text-down transition-colors hover:bg-down/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Tier selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          disabled={saving}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input/25 px-3 py-2.5 text-left transition-colors hover:border-accent/50 disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tier
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                TIER_BADGE[user.tier],
              )}
            >
              {TIER_LABEL[user.tier]}
            </span>
          </span>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                menuOpen && 'rotate-180',
              )}
            />
          )}
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close tier menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute left-0 right-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/40">
              {TIER_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeTier(t)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-input/40',
                    t === user.tier && 'bg-input/30',
                  )}
                >
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      TIER_BADGE[t],
                    )}
                  >
                    {TIER_LABEL[t]}
                  </span>
                  {t === user.tier && (
                    <CheckCircle2 className="h-4 w-4 text-up" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Usage grid */}
      <div className="grid grid-cols-4 gap-2">
        {FEATURES.map((f) => {
          const limit = TIER_DAILY_LIMIT[user.tier]
          const used = user.usageToday[f] || 0
          const maxed = limit !== null && limit > 0 && used >= limit
          return (
            <div
              key={f}
              title={FEATURE_LABEL[f]}
              className="flex flex-col items-center gap-1 rounded-xl bg-input/20 px-2 py-2.5 text-center"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {SHORT_LABEL[f]}
              </span>
              {limit === null ? (
                <span className="inline-flex items-center gap-0.5 font-mono text-sm font-bold text-up">
                  {used}
                  <InfinityIcon className="h-3 w-3" />
                </span>
              ) : (
                <span
                  className={cn(
                    'font-mono text-sm font-bold tabular-nums',
                    maxed ? 'text-down' : 'text-foreground',
                  )}
                >
                  {used}
                  <span className="text-muted-foreground">/{limit}</span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DeleteDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: UserRow
  onClose: () => void
  onDeleted: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function confirm() {
    if (loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to delete account.')
      }
      onDeleted()
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to delete account.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="border-luxe surface-luxe relative z-10 w-full max-w-sm overflow-hidden rounded-3xl p-6 shadow-2xl shadow-black/50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-down/20 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-down/15 text-down ring-1 ring-down/30">
            <Trash2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold tracking-tight">
            Delete this account?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{user.name}</span>{' '}
            ({user.email}) and all their usage data will be permanently removed.
            This cannot be undone.
          </p>

          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-down/30 bg-down/10 px-3 py-2 text-xs text-down">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="mt-5 flex w-full gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="btn-luxe-outline h-11 flex-1 rounded-xl border-transparent font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={confirm}
              disabled={loading}
              className="h-11 flex-1 gap-2 rounded-xl bg-down font-semibold text-white hover:bg-down/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TierSetter({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<Tier>('basic')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<
    { ok: true; message: string } | { ok: false; message: string } | null
  >(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body.error || 'Failed to set tier.')
      }
      setResult({
        ok: true,
        message: `${body.email} is now ${TIER_LABEL[tier]}.`,
      })
      setEmail('')
      onDone()
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Failed to set tier.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border-luxe surface-luxe relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <Mail className="h-4 w-4 text-accent" />
        <h2 className="text-lg font-bold tracking-tight">Set tier by email</h2>
      </div>
      <p className="relative mt-1 text-sm text-muted-foreground">
        Enter a registered email and choose a tier. If the email exists, the tier
        updates instantly on their account.
      </p>

      <form
        onSubmit={submit}
        className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="tier-email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            User email
          </label>
          <input
            id="tier-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
            className="h-11 w-full rounded-xl border border-border bg-input/25 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:w-44">
          <label
            htmlFor="tier-select"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Tier
          </label>
          <select
            id="tier-select"
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="h-11 w-full rounded-xl border border-border bg-input/25 px-3 text-sm outline-none transition-colors focus:border-accent/60"
          >
            {TIER_ORDER.map((t) => (
              <option key={t} value={t} className="bg-background">
                {TIER_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="btn-luxe h-11 gap-2 rounded-xl px-5 font-semibold"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Apply tier
        </Button>
      </form>

      {result && (
        <div
          className={cn(
            'relative mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
            result.ok
              ? 'border-up/30 bg-up/10 text-up'
              : 'border-down/30 bg-down/10 text-down',
          )}
        >
          {result.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          )}
          {result.message}
        </div>
      )}
    </section>
  )
}

type GroqKeyRow = {
  id: string
  label: string
  masked: string
  addedAt: number
  disabled: boolean
}

const keysFetcher = async (url: string): Promise<{ keys: GroqKeyRow[] }> => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to load API keys')
  }
  return res.json()
}

function GroqKeysPanel() {
  const { data, error, isLoading, mutate } = useSWR<{ keys: GroqKeyRow[] }>(
    '/api/admin/groq-keys',
    keysFetcher,
    { revalidateOnFocus: true },
  )
  const [keyValue, setKeyValue] = useState('')
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  )
  const [busyId, setBusyId] = useState<string | null>(null)

  const keys = data?.keys ?? []
  const activeCount = keys.filter((k) => !k.disabled).length

  async function addKey(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/groq-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyValue.trim(), label: label.trim() }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Failed to save key.')
      setResult({ ok: true, message: 'API key saved and now in rotation.' })
      setKeyValue('')
      setLabel('')
      mutate()
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Failed to save key.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleKey(row: GroqKeyRow) {
    setBusyId(row.id)
    try {
      await fetch('/api/admin/groq-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, disabled: !row.disabled }),
      })
      mutate()
    } finally {
      setBusyId(null)
    }
  }

  async function deleteKey(row: GroqKeyRow) {
    setBusyId(row.id)
    try {
      await fetch('/api/admin/groq-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id }),
      })
      mutate()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4" data-testid="groq-keys-panel">
      {/* Add key */}
      <section className="border-luxe surface-luxe relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-bold tracking-tight">Add Groq API key</h2>
        </div>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Keys are stored in the database and used by the chart analyzer in the
          order they were added. Use keys from separate Groq accounts so each
          has its own quota.
        </p>

        <form
          onSubmit={addKey}
          className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="groq-key"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Groq API key
            </label>
            <input
              id="groq-key"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="gsk_..."
              data-testid="groq-key-input"
              className="h-11 w-full rounded-xl border border-border bg-input/25 px-3 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:w-44">
            <label
              htmlFor="groq-label"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Label (optional)
            </label>
            <input
              id="groq-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Account 2"
              data-testid="groq-label-input"
              className="h-11 w-full rounded-xl border border-border bg-input/25 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            data-testid="groq-key-save-btn"
            className="btn-luxe h-11 gap-2 rounded-xl px-5 font-semibold"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Save key
          </Button>
        </form>

        {result && (
          <div
            data-testid="groq-key-result"
            className={cn(
              'relative mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
              result.ok
                ? 'border-up/30 bg-up/10 text-up'
                : 'border-down/30 bg-down/10 text-down',
            )}
          >
            {result.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            )}
            {result.message}
          </div>
        )}
      </section>

      {/* Key list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-input/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {keys.length} saved · {activeCount} active
          </span>
          <button
            type="button"
            onClick={() => mutate()}
            aria-label="Refresh keys"
            className="btn-luxe-outline flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            Loading keys…
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <AlertTriangle className="h-6 w-6 text-down" />
            {(error as Error)?.message || 'Failed to load API keys'}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {keys.map((row, i) => (
              <div
                key={row.id}
                data-testid={`groq-key-row-${row.id}`}
                className="border-luxe surface-luxe flex items-center gap-3 rounded-2xl p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {row.label || 'Groq key'}
                    {row.disabled && (
                      <span className="ml-2 rounded-full bg-input/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        paused
                      </span>
                    )}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {row.masked}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleKey(row)}
                  disabled={busyId === row.id}
                  aria-label={row.disabled ? 'Enable key' : 'Pause key'}
                  data-testid={`groq-key-toggle-${row.id}`}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
                    row.disabled
                      ? 'border-up/30 bg-up/10 text-up hover:bg-up/20'
                      : 'border-border bg-input/25 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteKey(row)}
                  disabled={busyId === row.id}
                  aria-label="Delete key"
                  data-testid={`groq-key-delete-${row.id}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-down/30 bg-down/10 text-down transition-colors hover:bg-down/20"
                >
                  {busyId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}

            {keys.length === 0 && (
              <div className="border-luxe surface-luxe col-span-full rounded-2xl px-4 py-10 text-center text-sm text-muted-foreground">
                No keys saved yet — the analyzer is using the built-in fallback
                keys. Add a key above to take control.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
