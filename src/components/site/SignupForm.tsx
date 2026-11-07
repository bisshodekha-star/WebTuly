'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthShell from './AuthShell'
import { useLang } from '@/content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function scorePassword(pw: string): number {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(3, score) // 1 weak, 2 good, 3 strong
}

function Inner() {
  const { t, dig } = useLang()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const score = useMemo(() => scorePassword(form.password), [form.password])
  const strengthLabel = ['—', t.auth.pw_weak, t.auth.pw_ok, t.auth.pw_strong][score]

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrs((er) => ({ ...er, [k]: '' }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const bad: Record<string, string> = {}
    if (form.name.trim().length < 2) bad.name = t.auth.e_name
    if (!EMAIL_RE.test(form.email)) bad.email = t.auth.e_email
    if (form.password.length < 8) bad.password = t.auth.e_password
    if (form.confirm !== form.password) bad.confirm = t.auth.e_confirm
    setErrs(bad)
    if (Object.keys(bad).length) return

    setBusy(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        router.push('/')
        router.refresh()
      } else if (data.error === 'email_exists') {
        setErrs({ email: t.auth.e_email_exists })
      } else if (data.error === 'fields') {
        setErrs({ password: t.auth.e_password })
      } else {
        setErrs({ name: t.auth.signup_fail })
      }
    } catch {
      setErrs({ name: t.auth.signup_fail })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{t.auth.signup_title}</h1>
      <p className="sub">{t.auth.signup_sub}</p>
      {(errs.name || errs.email || errs.password || errs.confirm) && (
        <div className="aerr">{errs.name || errs.email || errs.password || errs.confirm}</div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="afield">
          <label htmlFor="s-name">{t.auth.f_name}</label>
          <input
            id="s-name"
            type="text"
            placeholder={t.auth.ph_name}
            value={form.name}
            onChange={set('name')}
            required
            maxLength={80}
            autoComplete="name"
          />
        </div>
        <div className="afield">
          <label htmlFor="s-email">{t.auth.f_email}</label>
          <input
            id="s-email"
            type="email"
            placeholder={t.auth.ph_email}
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>
        <div className="afield">
          <label htmlFor="s-pass">{t.auth.f_password}</label>
          <input
            id="s-pass"
            type="password"
            placeholder={t.auth.ph_password}
            value={form.password}
            onChange={set('password')}
            required
            autoComplete="new-password"
          />
          {form.password && (
            <>
              <div className={`strength s${score}`}>
                <i />
                <i />
                <i />
              </div>
              <div className="hint">
                {t.auth.pw_hint}: {strengthLabel} ({dig(Math.min(form.password.length, 32))})
              </div>
            </>
          )}
        </div>
        <div className="afield">
          <label htmlFor="s-confirm">{t.auth.f_confirm}</label>
          <input
            id="s-confirm"
            type="password"
            placeholder={t.auth.ph_confirm}
            value={form.confirm}
            onChange={set('confirm')}
            required
            autoComplete="new-password"
          />
        </div>
        <button className="abtn" type="submit" disabled={busy}>
          {busy ? t.auth.working : t.auth.signup_btn}
        </button>
      </form>

      <p className="alt">
        {t.auth.to_login_q} <a href="/login">{t.auth.login_btn}</a>
      </p>
    </>
  )
}

export default function SignupForm() {
  return (
    <AuthShell titlePrefix="সাইন আপ · Sign up">
      <Inner />
    </AuthShell>
  )
}
