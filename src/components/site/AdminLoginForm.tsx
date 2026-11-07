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
    if (!EMAIL_RE.test(email) || !password) return setErr(t.admin.login_fail)
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, admin: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setErr(t.admin.login_fail)
      }
    } catch {
      setErr(t.admin.login_fail)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{t.admin.login_title}</h1>
      <p className="sub">{t.admin.login_sub}</p>
      {err && <div className="aerr">{err}</div>}

      <form onSubmit={submit} noValidate>
        <div className="afield">
          <label htmlFor="a-email">{t.auth.f_email}</label>
          <input
            id="a-email"
            type="email"
            placeholder={t.auth.ph_email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="afield">
          <label htmlFor="a-pass">{t.auth.f_password}</label>
          <input
            id="a-pass"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            autoFocus
          />
        </div>
        <button className="abtn" type="submit" disabled={busy}>
          {busy ? t.auth.working : t.admin.login_btn}
        </button>
      </form>

      <p className="alt">
        <a href="/admin/setup">{t.admin.no_admin_hint}</a>
      </p>
    </>
  )
}

export default function AdminLoginForm() {
  return (
    <AuthShell titlePrefix="Admin">
      <Inner />
    </AuthShell>
  )
}
