import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  videoUrl: z.string().trim().max(2000).default(''),
})

/** GET /api/admin/banner — current banner video setting (admin only). */
export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const row = await db.siteSetting.findUnique({ where: { key: 'banner_video' } })
    return NextResponse.json({ ok: true, videoUrl: row?.value ?? '' })
  } catch (err) {
    console.error('[admin/banner] read failed:', err)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}

/** PUT /api/admin/banner — save or clear the banner video URL (admin only). */
export async function PUT(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const videoUrl = parsed.data.videoUrl

  try {
    if (videoUrl) {
      await db.siteSetting.upsert({
        where: { key: 'banner_video' },
        update: { value: videoUrl },
        create: { key: 'banner_video', value: videoUrl },
      })
    } else {
      await db.siteSetting.deleteMany({ where: { key: 'banner_video' } })
    }
    return NextResponse.json({ ok: true, videoUrl })
  } catch (err) {
    console.error('[admin/banner] save failed:', err)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
