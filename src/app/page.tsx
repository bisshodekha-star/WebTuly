import type { Metadata } from 'next'
import PortfolioPage from '@/components/site/PortfolioPage'

/** The landing page is fully static — served from the CDN edge, zero server work. */
export const dynamic = 'force-static'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function Page() {
  return <PortfolioPage />
}
