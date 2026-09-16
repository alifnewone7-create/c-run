'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { ref, set, get, onValue } from 'firebase/database'
import { auth, db } from '@/lib/firebase'
import {
  FEATURES,
  dailyLimit,
  hasAccess as tierHasAccess,
  isUnlimited,
  normalizeTier,
  todayKey,
  type FeatureKey,
  type Tier,
} from '@/lib/tiers'

export type UserProfile = {
  uid: string
  name: string
  email: string
  plan: string
  createdAt: number
}

type UsageMap = Record<FeatureKey, number>

function emptyUsage(): UsageMap {
  return FEATURES.reduce((acc, f) => {
    acc[f] = 0
    return acc
  }, {} as UsageMap)
}

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  tier: Tier
  hasAccess: boolean
  usage: UsageMap
  /** Daily limit for the current tier. null = unlimited. */
  limit: number | null
  isUnlimited: boolean
  remaining: (feature: FeatureKey) => number | null
  /** Fresh Firebase ID token for authorizing server calls. */
  getToken: () => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Lightweight localStorage flag mirroring the Firebase session. Lets auth pages
 * synchronously detect a returning user and skip the login form flash.
 */
export const AUTH_STORAGE_KEY = 'sx_authed'

function persistAuthFlag(signedIn: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (signedIn) window.localStorage.setItem(AUTH_STORAGE_KEY, '1')
    else window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Ignore storage access errors (e.g. privacy mode).
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<UsageMap>(emptyUsage)
  const [loading, setLoading] = useState(true)
  const userRef = useRef<User | null>(null)

  const [dayKey, setDayKey] = useState<string>(() => todayKey())

  useEffect(() => {
    let unsubProfile: (() => void) | null = null

    const cleanupSubs = () => {
      unsubProfile?.()
      unsubProfile = null
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      cleanupSubs()
      setUser(firebaseUser)
      userRef.current = firebaseUser
      persistAuthFlag(!!firebaseUser)

      if (!firebaseUser) {
        setProfile(null)
        setUsage(emptyUsage())
        setLoading(false)
        return
      }

      // Ensure a profile record exists (first login fallback).
      const profileRef = ref(db, `users/${firebaseUser.uid}`)
      const snapshot = await get(profileRef)
      if (!snapshot.exists()) {
        const fallback: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName ?? 'Trader',
          email: firebaseUser.email ?? '',
          plan: 'free',
          createdAt: Date.now(),
        }
        await set(profileRef, fallback)
      }

      // Live subscription: tier changes from the admin panel apply instantly.
      unsubProfile = onValue(profileRef, (snap) => {
        if (snap.exists()) {
          setProfile(snap.val() as UserProfile)
        }
        setLoading(false)
      })
    })

    return () => {
      cleanupSubs()
      unsubscribe()
    }
  }, [])

  // Roll the usage window over at 6:00 AM BST even if the tab stays open, so a
  // long-lived session starts counting against the fresh day automatically.
  useEffect(() => {
    const tick = () => setDayKey((prev) => {
      const next = todayKey()
      return prev === next ? prev : next
    })
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  // Live subscription to the current window's usage counters. Re-subscribes
  // whenever the signed-in user or the day window changes.
  useEffect(() => {
    if (!user) {
      setUsage(emptyUsage())
      return
    }
    const usageRef = ref(db, `usage/${user.uid}/${dayKey}`)
    const unsub = onValue(usageRef, (snap) => {
      const val = (snap.val() as Record<string, number>) || {}
      setUsage(
        FEATURES.reduce((acc, f) => {
          acc[f] = Number(val[f]) || 0
          return acc
        }, {} as UsageMap),
      )
    })
    return () => unsub()
  }, [user, dayKey])

  const getToken = useCallback(async () => {
    const current = userRef.current
    if (!current) return null
    try {
      return await current.getIdToken()
    } catch {
      return null
    }
  }, [])

  async function register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      plan: 'free',
      createdAt: Date.now(),
    }
    await set(ref(db, `users/${cred.user.uid}`), newProfile)
    setProfile(newProfile)
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  const tier = normalizeTier(profile?.plan)
  const limit = dailyLimit(tier)

  const remaining = useCallback(
    (feature: FeatureKey): number | null => {
      if (isUnlimited(tier)) return null
      if (limit === null) return null
      return Math.max(0, limit - (usage[feature] || 0))
    },
    [tier, limit, usage],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        tier,
        hasAccess: tierHasAccess(tier),
        usage,
        limit,
        isUnlimited: isUnlimited(tier),
        remaining,
        getToken,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
