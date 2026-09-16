'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth, AUTH_STORAGE_KEY } from '@/components/auth-provider'

/**
 * Wraps the login / registration pages. If the user is already authenticated
 * they are sent straight to the dashboard. A synchronous localStorage check
 * lets us show a loader immediately for returning users, so the auth form is
 * never flashed for even a fraction of a second before the redirect.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [hadSession] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(AUTH_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  // Show a loader while we redirect an authenticated user, or while a stored
  // session is still being verified by Firebase — never the login form.
  if (user || (hadSession && loading)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm">Loading...</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
