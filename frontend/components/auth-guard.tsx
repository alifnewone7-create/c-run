'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth, type UserProfile } from '@/components/auth-provider'

export function AuthGuard({
  children,
}: {
  children: (profile: UserProfile) => React.ReactNode
}) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || !user || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm">Loading...</p>
        </div>
      </main>
    )
  }

  return <>{children(profile)}</>
}
