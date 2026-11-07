'use client'

import { useEffect, type ReactNode } from 'react'
import { LangProvider, useLang } from '@/content'

/** Keeps document.title in sync with the selected language on auth pages. */
function TitleSync({ prefix }: { prefix: string }) {
  const { lang } = useLang()
  useEffect(() => {
    document.title = `${prefix} — WebTuly`
    document.documentElement.lang = lang
  }, [lang, prefix])
  return null
}

/**
 * Centered auth card shell — reuses the site design tokens.
 * Pages wrap this with their own LangProvider via the component itself.
 */
export default function AuthShell({
  children,
  titlePrefix,
}: {
  children: ReactNode
  titlePrefix: string
}) {
  return (
    <LangProvider>
      <TitleSync prefix={titlePrefix} />
      <div className="auth-shell">
        <a className="auth-back" href="/">
          ← WebTuly
        </a>
        <div className="auth-card">{children}</div>
      </div>
    </LangProvider>
  )
}
