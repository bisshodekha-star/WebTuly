'use client'

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { bn } from './bn'
import { en } from './en'
import type { SiteContent } from './types'

export type Lang = 'bn' | 'en'

const CONTENT: Record<Lang, SiteContent> = { bn, en }
export const LANG_COOKIE = 'wt_lang'

/* ------------------------------------------------------------------
 * Tiny external store for the language.
 * useSyncExternalStore hydrates with the server snapshot ('bn'), then
 * automatically re-renders with the cookie value — no hydration
 * mismatch, no setState-in-effect.
 * ------------------------------------------------------------------ */
const listeners = new Set<() => void>()

function readCookieLang(): Lang {
  if (typeof document === 'undefined') return 'bn'
  const m = document.cookie.match(/(?:^|;\s*)wt_lang=(bn|en)/)
  return (m?.[1] as Lang) || 'bn'
}

let currentLang: Lang = typeof document === 'undefined' ? 'bn' : readCookieLang()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

const getSnapshot = () => currentLang
const getServerSnapshot = (): Lang => 'bn'

function setLangGlobal(l: Lang) {
  currentLang = l
  document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=${30 * 86400};samesite=lax`
  document.documentElement.lang = l
  listeners.forEach((fn) => fn())
}

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: SiteContent
  /** Convert latin digits to Bangla digits when lang=bn */
  dig: (s: string | number) => string
}

const Ctx = createContext<LangCtx>({
  lang: 'bn',
  setLang: () => {},
  toggle: () => {},
  t: bn,
  dig: (s) => String(s),
})

export function bnDigits(s: string | number): string {
  return String(s).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])
}

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const value: LangCtx = {
    lang,
    setLang: setLangGlobal,
    toggle: () => setLangGlobal(lang === 'bn' ? 'en' : 'bn'),
    t: CONTENT[lang],
    dig: (s) => (lang === 'bn' ? bnDigits(s) : String(s)),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang(): LangCtx {
  return useContext(Ctx)
}
