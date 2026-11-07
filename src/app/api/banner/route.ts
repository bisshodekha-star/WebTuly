import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/banner — public.
 * Returns the homepage banner video URL set from the admin panel
 * (empty string = no banner). Never fails hard — the homepage stays quiet.
 */
export async function GET() {
  try {
    const row = await db.siteSetting.findUnique({ where: { key: 'banner_video' } })
    return NextResponse.json(
      { ok: true, videoUrl: row?.value ?? '' },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch (err) {
    console.error('[banner] failed:', err)
    return NextResponse.json({ ok: true, videoUrl: '' })
  }
}
