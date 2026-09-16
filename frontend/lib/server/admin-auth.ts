// SERVER-ONLY admin panel authentication.
//
// The admin panel lives at /coco-private-island and is protected by a fixed set
// of credentials kept here on the server (never shipped to the client). A
// successful login sets a short HMAC-signed, httpOnly cookie that subsequent
// admin API calls verify.

import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Admin panel credentials (kept server-side only).
const ADMIN_USERNAME = 'iamhear'
const ADMIN_PASSWORD = 'iamhear'
const ADMIN_SECRET_KEY = 'iamhear'

// Secret used to sign the admin session cookie.
const COOKIE_SECRET = 'sx-portal-cookie-secret::9d4Fa!kQ72zP#rtdb$sweetex'

export const ADMIN_COOKIE = 'sx_portal_session'
// Long-lived session so admins stay signed in across visits (30 days).
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function verifyCredentials(
  username: string,
  password: string,
  secretKey: string,
): boolean {
  return (
    safeEqual(username || '', ADMIN_USERNAME) &&
    safeEqual(password || '', ADMIN_PASSWORD) &&
    safeEqual(secretKey || '', ADMIN_SECRET_KEY)
  )
}

function sign(payload: string): string {
  return createHmac('sha256', COOKIE_SECRET).update(payload).digest('hex')
}

// Cookie value = "<expiryMs>.<hmac>"
export function createSessionValue(): string {
  const expiry = String(Date.now() + SESSION_TTL_MS)
  return `${expiry}.${sign(expiry)}`
}

export function isValidSession(value: string | undefined | null): boolean {
  if (!value) return false
  const [expiry, mac] = value.split('.')
  if (!expiry || !mac) return false
  if (!safeEqual(mac, sign(expiry))) return false
  const expiryMs = Number(expiry)
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false
  return true
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
