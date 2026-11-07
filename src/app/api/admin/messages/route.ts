import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  filter: z.enum(['all', 'unread', 'read']).default('all'),
  q: z.string().trim().max(120).optional().default(''),
})

/** GET /api/admin/messages — list messages for the admin dashboard. */
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    filter: url.searchParams.get('filter') ?? 'all',
    q: url.searchParams.get('q') ?? '',
  })
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const { filter, q } = parsed.data

  try {
    const where = {
      ...(filter === 'unread' ? { isRead: false } : filter === 'read' ? { isRead: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
              { subject: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [messages, total, unread, today, week] = await Promise.all([
      db.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: 300 }),
      db.message.count(),
      db.message.count({ where: { isRead: false } }),
      db.message.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      db.message.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ])

    return NextResponse.json({
      ok: true,
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        body: m.body,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      })),
      counts: { total, unread, today, week },
    })
  } catch (err) {
    console.error('[admin/messages] failed:', err)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
