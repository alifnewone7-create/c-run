import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidSession } from '@/lib/server/admin-auth'
import {
  addGroqKey,
  listGroqKeys,
  maskKey,
  removeGroqKey,
  setGroqKeyDisabled,
} from '@/lib/server/groq-keys'

export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  return isValidSession(store.get(ADMIN_COOKIE)?.value)
}

const RULES_HINT =
  'Database denied access to config/groqKeys. Publish the updated Realtime Database rules (firebase-database-rules.json) in the Firebase console, then try again.'

function dbError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('401') || msg.includes('403')) {
    return Response.json({ error: RULES_HINT }, { status: 503 })
  }
  return Response.json({ error: msg }, { status: 500 })
}

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let keys
  try {
    keys = await listGroqKeys()
  } catch (err) {
    return dbError(err)
  }
  return Response.json({
    keys: keys.map((k) => ({
      id: k.id,
      label: k.label,
      masked: maskKey(k.key),
      addedAt: k.addedAt,
      disabled: Boolean(k.disabled),
    })),
  })
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let key = ''
  let label = ''
  try {
    const body = (await req.json()) as { key?: string; label?: string }
    key = (body.key || '').trim()
    label = (body.label || '').trim()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!key.startsWith('gsk_') || key.length < 20) {
    return Response.json(
      { error: 'Enter a valid Groq API key (starts with gsk_).' },
      { status: 400 },
    )
  }

  let added
  try {
    const existing = await listGroqKeys()
    if (existing.some((k) => k.key === key)) {
      return Response.json(
        { error: 'This key is already saved.' },
        { status: 409 },
      )
    }
    added = await addGroqKey(key, label)
  } catch (err) {
    return dbError(err)
  }
  return Response.json({
    ok: true,
    key: {
      id: added.id,
      label: added.label,
      masked: maskKey(added.key),
      addedAt: added.addedAt,
      disabled: false,
    },
  })
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let id = ''
  let disabled = false
  try {
    const body = (await req.json()) as { id?: string; disabled?: boolean }
    id = (body.id || '').trim()
    disabled = Boolean(body.disabled)
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  if (!id) return Response.json({ error: 'Key id required.' }, { status: 400 })

  try {
    await setGroqKeyDisabled(id, disabled)
  } catch (err) {
    return dbError(err)
  }
  return Response.json({ ok: true })
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let id = ''
  try {
    const body = (await req.json()) as { id?: string }
    id = (body.id || '').trim()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  if (!id) return Response.json({ error: 'Key id required.' }, { status: 400 })

  try {
    await removeGroqKey(id)
  } catch (err) {
    return dbError(err)
  }
  return Response.json({ ok: true })
}
