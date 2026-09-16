'use client'

import { useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useUpgradeGate } from '@/components/upgrade-gate'
import { hasAccess as tierHasAccess, type FeatureKey } from '@/lib/tiers'

type GateCheck =
  | { allowed: true; token: string }
  | { allowed: false }

/**
 * Central client-side guard for the four credit-gated features.
 *
 * IMPORTANT: this is only a UX shortcut. Real enforcement happens on the
 * server (every gated route calls consumeCredit). This hook prevents obvious
 * wasted calls and surfaces the upgrade modal, but bypassing it in the console
 * changes nothing — the server still rejects unauthorized / over-limit calls.
 */
export function useGatedAction(feature: FeatureKey) {
  const { user, tier, getToken, remaining } = useAuth()
  const { open } = useUpgradeGate()

  // Preflight: verify sign-in + access + remaining credits before calling.
  // `amount` is how many credits the action will consume (default 1). Tools
  // that generate a batch (e.g. Future Signals) pass the requested count so
  // we can block early when there aren't enough credits left for the batch.
  const preflight = useCallback(async (amount = 1): Promise<GateCheck> => {
    if (!user) {
      open({
        reason: 'locked',
        feature,
        message: 'Please sign in to use this tool.',
      })
      return { allowed: false }
    }

    if (!tierHasAccess(tier)) {
      open({ reason: 'locked', feature })
      return { allowed: false }
    }

    const left = remaining(feature)
    if (left !== null && left < Math.max(1, Math.floor(amount))) {
      open({ reason: 'limit', feature })
      return { allowed: false }
    }

    const token = await getToken()
    if (!token) {
      open({
        reason: 'locked',
        feature,
        message: 'Your session expired. Please sign in again.',
      })
      return { allowed: false }
    }

    return { allowed: true, token }
  }, [user, tier, feature, remaining, getToken, open])

  // Map a server error response to the correct modal.
  const handleServerGate = useCallback(
    (status: number, body: { code?: string; error?: string }) => {
      if (status === 403 && body.code === 'locked') {
        open({ reason: 'locked', feature })
        return true
      }
      if (status === 429 && body.code === 'limit') {
        open({ reason: 'limit', feature, message: body.error })
        return true
      }
      if (status === 401) {
        open({
          reason: 'locked',
          feature,
          message: 'Please sign in to use this tool.',
        })
        return true
      }
      return false
    },
    [feature, open],
  )

  return { preflight, handleServerGate }
}
