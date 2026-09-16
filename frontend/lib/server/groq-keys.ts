// SERVER-ONLY Groq API key store (Firebase Realtime Database backed).
//
// Keys are managed from the admin panel and stored at `config/groqKeys`.
// The analyzer walks the list in order and fails over to the next key when
// one is rate limited / out of quota.

import 'server-only'
import { dbGet, dbSet, dbUpdate, dbDelete } from '@/lib/server/firebase-admin'

export type GroqKeyRecord = {
  id: string
  key: string
  label: string
  addedAt: number
  disabled?: boolean
}

// Stored under the `usage` branch (already writable by the internal admin
// identity in the database rules) so no rule change is needed.
const DB_PATH = 'usage/__config/groqKeys'

// Fallback when the admin panel has no keys stored yet.
const FALLBACK_KEYS: string[] = []

export function maskKey(key: string): string {
  if (key.length <= 12) return `${key.slice(0, 4)}••••`
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`
}

export async function listGroqKeys(): Promise<GroqKeyRecord[]> {
  const raw = await dbGet<Record<string, GroqKeyRecord>>(DB_PATH)
  return Object.entries(raw || {})
    .map(([id, v]) => ({
      id,
      key: String(v?.key || ''),
      label: String(v?.label || ''),
      addedAt: Number(v?.addedAt) || 0,
      disabled: Boolean(v?.disabled),
    }))
    .filter((k) => k.key)
    .sort((a, b) => a.addedAt - b.addedAt)
}

// Active keys used by the analyzer, in failover order.
export async function getActiveGroqKeys(): Promise<string[]> {
  try {
    const keys = (await listGroqKeys())
      .filter((k) => !k.disabled)
      .map((k) => k.key)
    if (keys.length) return Array.from(new Set(keys))
  } catch (err) {
    console.log('[groq-keys] DB read failed, using fallback keys', err)
  }
  return Array.from(new Set(FALLBACK_KEYS))
}

export async function addGroqKey(
  key: string,
  label: string,
): Promise<GroqKeyRecord> {
  const id = `k_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const record: GroqKeyRecord = {
    id,
    key: key.trim(),
    label: label.trim() || 'Groq key',
    addedAt: Date.now(),
    disabled: false,
  }
  await dbSet(`${DB_PATH}/${id}`, record)
  return record
}

export async function setGroqKeyDisabled(
  id: string,
  disabled: boolean,
): Promise<void> {
  await dbUpdate(`${DB_PATH}/${id}`, { disabled })
}

export async function removeGroqKey(id: string): Promise<void> {
  await dbDelete(`${DB_PATH}/${id}`)
}
