import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getClientIp, getSession } from '@/lib/auth'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(5).max(3000),
  /** honeypot — must be empty */
  website: z.string().max(0).optional().or(z.literal('')).optional(),
})

const MSG = {
  bn: {
    rate: 'অনেক বেশি মেসেজ পাঠানো হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    fields: 'অনুগ্রহ করে সব ঘর সঠিকভাবে পূরণ করুন।',
    server: 'সার্ভারে সমস্যা — কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  },
  en: {
    rate: 'Too many messages. Please try again later.',
    fields: 'Please fill all fields correctly.',
    server: 'Server error — please try again later.',
  },
} as const

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)

  // per-instance quick limit (1 per 20s) + global DB limit (5 per 10 min, like the PHP)
  if (!rateLimit(`contact:${ip}`, 1, 20_000)) {
    return NextResponse.json({ ok: false, error: MSG.bn.rate }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: MSG.bn.fields }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: MSG.bn.fields }, { status: 422 })
  }

  // honeypot filled → pretend success so bots learn nothing
  if (parsed.data.website) {
    return NextResponse.json({ ok: true })
  }

  try {
    // DB-level rate limit across all instances (same policy as the PHP site)
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const recent = await db.message.count({
      where: { ip, createdAt: { gte: since } },
    })
    if (recent >= 5) {
      return NextResponse.json({ ok: false, error: MSG.bn.rate }, { status: 429 })
    }

    // link to the signed-in account (if any)
    const session = await getSession()

    await db.message.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        body: parsed.data.message,
        ip,
        userId: session?.uid ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] failed:', err)
    return NextResponse.json({ ok: false, error: MSG.bn.server }, { status: 500 })
  }
}
