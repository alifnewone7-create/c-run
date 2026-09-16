'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Lock,
  Mail,
  UserRound,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
  BrainCircuit,
  Waypoints,
  Gauge,
  BadgeCheck,
  CircleAlert,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

type AuthMode = 'login' | 'registration'

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9aa3]">
      {children}
    </span>
  )
}

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const { login, register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      router.push('/dashboard')
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : ''
      setError(friendlyError(code))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="coco-rise w-full max-w-[440px] rounded-[20px] border border-[var(--hairline)] bg-white p-6 shadow-[rgba(0,0,0,0.04)_0_12px_24px_-8px,rgba(0,0,0,0.04)_0_0_0_1px] sm:p-8"
      data-testid="auth-card"
    >
      <div className="grid grid-cols-2 gap-1 rounded-[10px] border border-[var(--hairline)] bg-[var(--mist)] p-1">
        <Link
          href="/login"
          data-active={isLogin}
          aria-current={isLogin ? 'page' : undefined}
          className="coco-tab"
          data-testid="auth-tab-login"
        >
          Login
        </Link>
        <Link
          href="/registration"
          data-active={!isLogin}
          aria-current={!isLogin ? 'page' : undefined}
          className="coco-tab"
          data-testid="auth-tab-registration"
        >
          Registration
        </Link>
      </div>

      <div className="mt-7 text-center">
        <h1 className="coco-display coco-title-gradient text-[1.9rem] sm:text-[2.1rem]" data-testid="auth-heading">
          {isLogin ? 'Welcome back.' : 'Create your account.'}
        </h1>
        <p className="coco-muted mt-2 text-sm leading-relaxed">
          {isLogin
            ? 'Sign in to reach your Coco AI trading console.'
            : 'Set up an operator profile and the engine starts reading the tape for you.'}
        </p>
      </div>

      <form className="mt-7 flex flex-col gap-3.5" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="relative">
            <FieldIcon>
              <UserRound className="h-[18px] w-[18px]" />
            </FieldIcon>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="coco-input"
              data-testid="auth-input-name"
            />
          </div>
        )}

        <div className="relative">
          <FieldIcon>
            <Mail className="h-[18px] w-[18px]" />
          </FieldIcon>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className="coco-input"
            data-testid="auth-input-email"
          />
        </div>

        <div className="relative">
          <FieldIcon>
            <Lock className="h-[18px] w-[18px]" />
          </FieldIcon>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className="coco-input"
            data-testid="auth-input-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9aa3] transition-colors hover:text-[var(--ink)]"
            data-testid="auth-toggle-password"
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[#ffd0cd] bg-[#fff5f4] px-3 py-2.5 text-sm text-[#c0322a]"
            data-testid="auth-error"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="coco-btn coco-btn-primary mt-2 h-12 w-full disabled:opacity-70"
          data-testid="auth-submit"
        >
          {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {submitting
            ? isLogin
              ? 'Signing in...'
              : 'Creating account...'
            : isLogin
              ? 'Sign in'
              : 'Create account'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="coco-muted mt-6 text-center text-sm">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link
          href={isLogin ? '/registration' : '/login'}
          className="font-semibold text-[var(--iris)] transition-opacity hover:opacity-70"
          data-testid="auth-switch-link"
        >
          {isLogin ? 'Register now' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}

const BRAND_POINTS = [
  {
    icon: Waypoints,
    label: 'Full market sweep',
    text: 'Autonomous scanning across OTC and real pairs',
  },
  {
    icon: Gauge,
    label: 'Zero lag delivery',
    text: 'Verdicts delivered the second confluence lands',
  },
  {
    icon: BadgeCheck,
    label: 'Scored conviction',
    text: 'Confidence scoring on every single entry',
  },
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="coco grid min-h-dvh grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]" data-testid="auth-layout">
      {/* Dark brand panel */}
      <aside className="coco-auth-panel relative hidden flex-col justify-between overflow-hidden p-10 xl:p-14 lg:flex">
        <span className="coco-auth-panel-glow" aria-hidden="true" />
        <span className="coco-auth-panel-edge" aria-hidden="true" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <Image
            src="/coco-ai.jpg"
            alt="Coco AI"
            width={40}
            height={40}
            className="rounded-xl ring-1 ring-white/20"
          />
          <span className="coco-sub text-lg text-white">
            Coco <span className="coco-accent">AI</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-[440px]">
          <span className="coco-eyebrow">
            <BrainCircuit className="h-3 w-3" />
            Trading intelligence
          </span>
          <h2 className="coco-display coco-title-gradient mt-6 text-balance text-[2.1rem] leading-[1.08] xl:text-[2.5rem]">
            The market never sleeps. Neither does Coco AI.
          </h2>
          <p className="mt-4 max-w-[38ch] text-pretty text-sm leading-relaxed text-white/55">
            One console for OTC and real pairs, with a verdict, a confidence score and a timeframe
            on every call.
          </p>

          <ul className="mt-10 flex flex-col gap-3">
            {BRAND_POINTS.map((p, i) => (
              <li
                key={p.text}
                className="coco-auth-point"
                style={{ '--d': `${120 + i * 90}ms` } as React.CSSProperties}
              >
                <span className="coco-auth-point-icon">
                  <p.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="coco-mono block text-[9.5px] uppercase tracking-[0.16em] text-[#c4a6ff]/75">
                    {p.label}
                  </span>
                  <span className="mt-1 block text-[13.5px] font-medium leading-snug text-white/82">
                    {p.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="coco-mono relative z-10 text-[11px] uppercase text-white/35">
          © {new Date().getFullYear()} Coco AI
        </p>
      </aside>

      {/* Light form panel */}
      <div className="coco-light flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/coco-ai.jpg"
              alt="Coco AI"
              width={60}
              height={60}
              className="rounded-2xl ring-1 ring-[var(--hairline)]"
            />
          </Link>
          <div className="text-center">
            <span className="coco-sub text-xl">
              Coco <span className="text-[var(--iris)]">AI</span>
            </span>
            <p className="coco-mono mt-1 text-[10px] uppercase tracking-[0.1em] text-[var(--dim)]">
              Autonomous trading engine
            </p>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}
