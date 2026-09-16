'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, User, Loader2, AlertTriangle, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CocoHeroBg } from '@/components/coco/coco-hero-bg'

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secretKey }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Invalid credentials.')
      }
      try {
        window.localStorage.setItem('sx_admin_authed', '1')
      } catch {
        // ignore storage errors (e.g. privacy mode)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="coco coco-dark relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <CocoHeroBg />
      <div className="coco-d2-hero relative z-10 w-full max-w-sm !p-6 sm:!p-8">
        <span className="coco-d2-hero-line" aria-hidden="true" />

        <div className="relative flex flex-col items-center text-center">
          <span className="coco-d2-meta-icon !h-14 !w-14 !rounded-2xl">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <span className="coco-eyebrow mt-4">Restricted</span>
          <h1 className="coco-display coco-title-gradient mt-3 text-2xl">Secure Portal</h1>
          <p className="mt-1.5 text-sm text-white/60">
            Authorized access only. Enter your portal credentials.
          </p>
        </div>

        <form onSubmit={submit} className="relative mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-username"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="h-11 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
                placeholder="username"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-secret"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Secret key
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-secret"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                autoComplete="off"
                required
                className="h-11 w-full rounded-xl border border-border bg-input/25 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
                placeholder="Enter secret key"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-down/30 bg-down/10 px-3 py-2 text-xs text-down">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="btn-luxe mt-1 h-12 w-full gap-2 rounded-xl text-base font-semibold"
          >
            {loading ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <ShieldCheck className="h-[18px] w-[18px]" />
            )}
            {loading ? 'Verifying…' : 'Enter portal'}
          </Button>
        </form>
      </div>
    </main>
  )
}
