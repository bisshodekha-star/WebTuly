import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, getClientIp, type Role } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  // 5 signups per hour per IP — blocks mass fake-account creation
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again later.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'fields' }, { status: 422 })
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ ok: false, error: 'email_exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role: 'USER' },
    })

    const token = await createSessionToken({
      uid: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    })

    const res = NextResponse.json({
      ok: true,
      user: { uid: user.id, name: user.name, email: user.email, role: user.role },
    })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (err) {
    console.error('[signup] failed:', err)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
