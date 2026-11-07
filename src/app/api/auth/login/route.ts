import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, getClientIp, type Role } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(72),
  /** when true, only ADMIN accounts may log in */
  admin: z.boolean().optional(),
})

const MSG = {
  bn: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
  en: 'Wrong email or password.',
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  // 10 login attempts per 5 minutes per IP — slows brute force
  if (!rateLimit(`login:${ip}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: MSG.bn }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: MSG.bn }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: MSG.bn }, { status: 422 })
  }

  const { email, password, admin } = parsed.data

  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    // constant-ish time: always run a hash compare
    const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin'
    const valid = await bcrypt.compare(password, hash)

    if (!user || !valid) {
      return NextResponse.json({ ok: false, error: MSG.bn }, { status: 401 })
    }
    if (admin && user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: MSG.bn }, { status: 403 })
    }

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
    console.error('[login] failed:', err)
    return NextResponse.json({ ok: false, error: MSG.bn }, { status: 500 })
  }
}
