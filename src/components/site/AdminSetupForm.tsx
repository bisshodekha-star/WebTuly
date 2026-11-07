'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthShell from './AuthShell'
import { useLang } from '@/content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Inner({ needsKey }: { needsKey: boolean }) {
  const { t } = useLang()
  const router = useRouter()
  const [form, setForm] = useState({ key: '', name: '', email: '', password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErr('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2) return setErr(t.auth.e_name)
    if (!EMAIL_RE.test(form.email)) return setErr(t.auth.e_email)
    if (form.password.length < 8) return setErr(t.auth.e_password)
    if (form.confirm !== form.password) return setErr(t.auth.e_confirm)
    if (needsKey && !form.key) return setErr(t.auth.e_password)
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: form.key,
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        router.push('/admin')
        router.refresh()
      } else if (data.error === 'bad_key') {
        setErr(t.auth.e_password)
      } else if (data.error === 'email_exists') {
        setErr(t.auth.e_email_exists)
      } else if (data.error === 'already_setup') {
        router.push('/admin/login')
      } else {
        setErr(t.admin.setup_done.replace(/→.*$/, '').trim() || t.auth.signup_fail)
      }
    } catch {
      setErr(t.auth.signup_fail)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{t.admin.setup_title}</h1>
      <p className="sub">{t.admin.setup_sub}</p>
      {err && <div className="aerr">{err}</div>}

      <form onSubmit={submit} noValidate>
        {needsKey && (
          <div className="afield">
            <label htmlFor="su-key">{t.admin.setup_key}</label>
            <input
              id="su-key"
              type="password"
              placeholder="••••••••"
              value={form.key}
              onChange={set('key')}
              required
              autoComplete="off"
            />
          </div>
        )}
        <div className="afield">
          <label htmlFor="su-name">{t.auth.f_name}</label>
          <input
            id="su-name"
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
          <label htmlFor="su-email">{t.auth.f_email}</label>
          <input
            id="su-email"
            type="email"
            placeholder={t.auth.ph_email}
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>
        <div className="afield">
          <label htmlFor="su-pass">{t.auth.f_password}</label>
          <input
            id="su-pass"
            type="password"
            placeholder={t.auth.ph_password}
            value={form.password}
            onChange={set('password')}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="afield">
          <label htmlFor="su-confirm">{t.auth.f_confirm}</label>
          <input
            id="su-confirm"
            type="password"
            placeholder={t.auth.ph_confirm}
            value={form.confirm}
            onChange={set('confirm')}
            required
            autoComplete="new-password"
          />
        </div>
        <button className="abtn" type="submit" disabled={busy}>
          {busy ? t.auth.working : t.admin.setup_btn}
        </button>
      </form>

      <p className="alt">
        <a href="/admin/login">{t.admin.login_title}</a>
      </p>
    </>
  )
}

export default function AdminSetupForm({ needsKey }: { needsKey: boolean }) {
  return (
    <AuthShell titlePrefix="Setup">
      <Inner needsKey={needsKey} />
    </AuthShell>
  )
}
