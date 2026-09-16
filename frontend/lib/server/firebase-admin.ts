// SERVER-ONLY Firebase helper.
//
// This module talks to Firebase Auth and the Realtime Database over their REST
// APIs. It never runs on the client (it is only imported by route handlers).
//
// Because this project does not use a Firebase service account, privileged
// reads/writes are performed by signing in as a dedicated, internal Firebase
// Auth account whose credentials live here on the server only. Regular users
// can never obtain these credentials, and the Realtime Database security rules
// grant tier/usage write access exclusively to this account's email.

import 'server-only'

const API_KEY = 'AIzaSyAo1DFoWoWo-W5zFEf5IqSJN6GB1EHp7Bo'
const DB_URL =
  'https://coco-ai-c363d-default-rtdb.asia-southeast1.firebasedatabase.app'

// Dedicated internal admin identity (NOT a real end user). The security rules
// reference this exact email to authorize tier + usage writes.
export const ADMIN_DB_EMAIL = 'portal-admin@coco-ai.internal'
const ADMIN_DB_PASSWORD = 'Sx9!portal_Rtdb#adminOnly_2f7Kd$Qa1zP'

const IDENTITY_BASE = 'https://identitytoolkit.googleapis.com/v1'

type LookupUser = {
  uid: string
  email: string
}

// Verify an end user's Firebase ID token and return their uid/email.
// Google validates the token for us; a forged/expired token yields null.
export async function verifyIdToken(
  idToken: string | null | undefined,
): Promise<LookupUser | null> {
  if (!idToken) return null
  try {
    const res = await fetch(`${IDENTITY_BASE}/accounts:lookup?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      users?: Array<{ localId: string; email?: string }>
    }
    const user = data.users?.[0]
    if (!user?.localId) return null
    return { uid: user.localId, email: user.email ?? '' }
  } catch {
    return null
  }
}

// --- Admin token (cached in memory, refreshed before expiry) ---
let cachedAdminToken: { token: string; expiresAt: number } | null = null

async function signIn(email: string, password: string) {
  return fetch(`${IDENTITY_BASE}/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
}

async function signUp(email: string, password: string) {
  return fetch(`${IDENTITY_BASE}/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
}

export async function getAdminToken(): Promise<string> {
  const now = Date.now()
  if (cachedAdminToken && cachedAdminToken.expiresAt > now + 60_000) {
    return cachedAdminToken.token
  }

  let res = await signIn(ADMIN_DB_EMAIL, ADMIN_DB_PASSWORD)
  if (!res.ok) {
    // First-run bootstrap: the internal account does not exist yet, create it.
    const created = await signUp(ADMIN_DB_EMAIL, ADMIN_DB_PASSWORD)
    if (!created.ok) {
      const errText = await created.text().catch(() => '')
      throw new Error(`Admin auth failed: ${errText || created.status}`)
    }
    res = created
  }

  const data = (await res.json()) as { idToken: string; expiresIn: string }
  cachedAdminToken = {
    token: data.idToken,
    expiresAt: now + (Number(data.expiresIn) - 120) * 1000,
  }
  return data.idToken
}

// --- Realtime Database REST (all privileged, using the admin token) ---
function dbUrl(path: string, token: string) {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return `${DB_URL}/${clean}.json?auth=${token}`
}

export async function dbGet<T = unknown>(path: string): Promise<T | null> {
  const token = await getAdminToken()
  const res = await fetch(dbUrl(path, token), { cache: 'no-store' })
  if (!res.ok) throw new Error(`DB read failed (${res.status})`)
  return (await res.json()) as T | null
}

export async function dbSet(path: string, value: unknown): Promise<void> {
  const token = await getAdminToken()
  const res = await fetch(dbUrl(path, token), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) throw new Error(`DB write failed (${res.status})`)
}

export async function dbUpdate(
  path: string,
  value: Record<string, unknown>,
): Promise<void> {
  const token = await getAdminToken()
  const res = await fetch(dbUrl(path, token), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) throw new Error(`DB update failed (${res.status})`)
}

export async function dbDelete(path: string): Promise<void> {
  const token = await getAdminToken()
  const res = await fetch(dbUrl(path, token), { method: 'DELETE' })
  if (!res.ok) throw new Error(`DB delete failed (${res.status})`)
}
