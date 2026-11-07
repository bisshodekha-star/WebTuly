'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthShell from './AuthShell'
import { useLang } from '@/content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Inner() {
  const { t } = useLang()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) return setErr(t.auth.e_email)
    if (!password) return setErr(t.auth.e_password)
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        router.push(data.user?.role === 'ADMIN' ? '/admin' : '/')
        router.refresh()
      } else if (data.error === 'email_exists') {
        setErr(t.auth.e_email_exists)
      } else {
        setErr(t.auth.login_fail)
      }
    } catch {
      setErr(t.auth.login_fail)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{t.auth.login_title}</h1>
      <p className="sub">{t.auth.login_sub}</p>
      {err && <div className="aerr">{err}</div>}

      <form onSubmit={submit} noValidate>
        <div className="afield">
          <label htmlFor="l-email">{t.auth.f_email}</label>
          <input
            id="l-email"
            type="email"
            placeholder={t.auth.ph_email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="afield">
          <label htmlFor="l-pass">{t.auth.f_password}</label>
          <input
            id="l-pass"
            type="password"
            placeholder={t.auth.ph_password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="abtn" type="submit" disabled={busy}>
          {busy ? t.auth.working : t.auth.login_btn}
        </button>
      </form>

      <p className="alt">
        {t.auth.to_login_q} <a href="/signup">{t.auth.to_signup}</a>
      </p>
    </>
  )
}

export default function LoginForm() {
  return (
    <AuthShell titlePrefix="লগইন · Login">
      <Inner />
    </AuthShell>
  )
}
