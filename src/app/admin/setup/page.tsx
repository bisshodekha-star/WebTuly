import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSetupForm from '@/components/site/AdminSetupForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Setup — WebTuly',
  robots: { index: false, follow: false },
}

/**
 * First-run admin creation. Once any ADMIN exists this page always
 * redirects to the login screen.
 */
export default async function AdminSetupPage() {
  let adminCount = 0
  try {
    adminCount = await db.user.count({ where: { role: 'ADMIN' } })
  } catch (err) {
    console.error('[admin/setup] db check failed:', err)
  }
  if (adminCount > 0) redirect('/admin/login')

  const needsKey = Boolean(process.env.ADMIN_SETUP_KEY?.trim())
  return <AdminSetupForm needsKey={needsKey} />
}
