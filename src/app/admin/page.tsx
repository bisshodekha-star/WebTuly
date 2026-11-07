import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminDashboard from '@/components/site/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin — WebTuly',
  robots: { index: false, follow: false },
}

/** Protected: only ADMIN sessions reach the dashboard, others go to login. */
export default async function AdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return <AdminDashboard adminName={session.name} />
}
