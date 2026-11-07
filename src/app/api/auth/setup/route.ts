import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, getClientIp } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const setupSchema = z.object({
  key: z.string().max(120).optional().default(''),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
})

/**
 * First-run admin creation.
 * - Only works while NO admin account exists.
 * - When ADMIN_SETUP_KEY is set, the key must match.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`setup:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = setupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'fields' }, { status: 422 })
  }

  try {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } })
    if (adminCount > 0) {
      return NextResponse.json({ ok: false, error: 'already_setup' }, { status: 403 })
    }

    const requiredKey = process.env.ADMIN_SETUP_KEY?.trim()
    if (requiredKey && parsed.data.key !== requiredKey) {
      return NextResponse.json({ ok: false, error: 'bad_key' }, { status: 403 })
    }

    const email = parsed.data.email.toLowerCase()
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ ok: false, error: 'email_exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10)
    const user = await db.user.create({
      data: { name: parsed.data.name, email, passwordHash, role: 'ADMIN' },
    })

    const token = await createSessionToken({
      uid: user.id,
      name: user.name,
      email: user.email,
      role: 'ADMIN',
    })

    const res = NextResponse.json({
      ok: true,
      user: { uid: user.id, name: user.name, email: user.email, role: user.role },
    })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (err) {
    console.error('[setup] failed:', err)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
