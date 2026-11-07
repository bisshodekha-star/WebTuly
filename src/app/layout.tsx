import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WebTuly',
  },
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
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" suppressHydrationWarning className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body>
        {children}
        {/* PWA: register the minimal service worker (installability without stale-cache risk) */}
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}) }) }`}
        </Script>
      </body>
    </html>
  )
}
