import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const patchSchema = z.object({ isRead: z.boolean() })

/** PATCH /api/admin/messages/[id] — mark read/unread. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const msgId = parseInt(id, 10)
  if (!Number.isInteger(msgId)) {
    return NextResponse.json({ ok: false, error: 'bad_id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 422 })
  }

  try {
    await db.message.update({ where: { id: msgId }, data: { isRead: parsed.data.isRead } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
}

/** DELETE /api/admin/messages/[id] */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const msgId = parseInt(id, 10)
  if (!Number.isInteger(msgId)) {
    return NextResponse.json({ ok: false, error: 'bad_id' }, { status: 400 })
  }

  try {
    await db.message.delete({ where: { id: msgId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
}
