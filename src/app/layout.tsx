import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Inter } from 'next/font/google'
import './globals.css'
import './site.css'

/**
 * Fonts are self-hosted via next/font (no external Google Fonts request,
 * no layout shift) — a major speed win over the old <link> approach.
 */
const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind',
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Note: <title> + meta description are rendered from the client tree so they
  // can switch with the bn/en language toggle (single owner = no conflicts).
  keywords: ['web developer', 'ওয়েব ডেভেলপার', 'WebTuly', 'freelancer', 'Bangladesh', 'website'],
  authors: [{ name: 'WebTuly' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'WebTuly — ওয়েব ডেভেলপার',
    description: 'দ্রুত, আধুনিক ও রেসপনসিভ ওয়েবসাইট — পরিচ্ছন্ন কোডে।',
    url: SITE_URL,
    siteName: 'WebTuly',
    type: 'website',
    locale: 'bn_BD',
  },
  twitter: {
    card: 'summary',
    title: 'WebTuly — ওয়েব ডেভেলপার',
    description: 'দ্রুত, আধুনিক ও রেসপনসিভ ওয়েবসাইট — পরিচ্ছন্ন কোডে।',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070b14',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" suppressHydrationWarning className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
