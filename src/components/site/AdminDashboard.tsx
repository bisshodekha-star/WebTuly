'use client'

import { useCallback, useEffect, useState } from 'react'
import { LangProvider, useLang } from '@/content'

interface Msg {
  id: number
  name: string
  email: string
  subject: string
  body: string
  isRead: boolean
  createdAt: string
}

interface Counts {
  total: number
  unread: number
  today: number
  week: number
}

/* ================= BANNER VIDEO SETTING (→ /api/admin/banner) ================= */
function BannerCard() {
  const { t } = useLang()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'fail' | ''; msg: string }>({ kind: '', msg: '' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let on = true
    fetch('/api/admin/banner')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (on && d?.ok) setUrl(d.videoUrl || '')
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoaded(true)
      })
    return () => {
      on = false
    }
  }, [])

  const save = async (clear = false) => {
    setBusy(true)
    setStatus({ kind: '', msg: '' })
    try {
      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: clear ? '' : url.trim() }),
      })
      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setUrl(data.videoUrl || '')
        setStatus({ kind: 'ok', msg: t.admin.banner_saved })
      } else {
        setStatus({ kind: 'fail', msg: t.admin.banner_fail })
      }
    } catch {
      setStatus({ kind: 'fail', msg: t.admin.banner_fail })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="banner-card">
      <h2>{t.admin.banner_title}</h2>
      <p className="bsub">{t.admin.banner_sub}</p>
      <div className="brow">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setStatus({ kind: '', msg: '' })
          }}
          placeholder={t.admin.banner_ph}
          maxLength={2000}
          aria-label={t.admin.banner_title}
        />
        <button className="bbtn" onClick={() => save(false)} disabled={busy}>
          {busy ? t.admin.banner_saving : t.admin.banner_save}
        </button>
        {url.trim() !== '' && (
          <button className="bbtn bghost" onClick={() => save(true)} disabled={busy}>
            {t.admin.banner_clear}
          </button>
        )}
      </div>
      <p className="bhint">{t.admin.banner_hint}</p>
      {status.kind === 'ok' && <p className="bstat">{status.msg}</p>}
      {status.kind === 'fail' && <p className="bstat fail">{status.msg}</p>}
      {loaded && status.kind === '' && (
        <p className="bstat" style={{ color: 'var(--text-muted)' }}>
          {url
            ? (
              <>
                {t.admin.banner_current}{' '}
                <a href={url} target="_blank" rel="noreferrer">
                  {url.length > 60 ? `${url.slice(0, 60)}…` : url}
                </a>
              </>
            )
            : t.admin.banner_none}
        </p>
      )}
    </div>
  )
}

function Dashboard({ adminName }: { adminName: string }) {
  const { t, lang, dig } = useLang()
  const [messages, setMessages] = useState<Msg[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, unread: 0, today: 0, week: 0 })
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [err, setErr] = useState('')

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const params = new URLSearchParams({ filter })
        if (q.trim()) params.set('q', q.trim())
        const res = await fetch(`/api/admin/messages?${params}`)
        if (res.status === 401) {
          window.location.href = '/admin/login'
          return
        }
        const data = await res.json()
        if (res.ok && data.ok) {
          setMessages(data.messages)
          setCounts(data.counts)
          setErr('')
        } else {
          setErr(t.admin.delete_fail)
        }
      } catch {
        setErr(t.admin.delete_fail)
      } finally {
        setLoading(false)
      }
    },
    [filter, q, t]
  )

  /* load whenever filter/search changes (debounced by cleanup) — always uses the
     latest load closure, so the search never runs with a stale query */
  useEffect(() => {
    const id = setTimeout(() => load(), 250)
    return () => clearTimeout(id)
  }, [load])

  /* silent polling every 60s */
  useEffect(() => {
    const iv = setInterval(() => load(true), 60_000)
    return () => clearInterval(iv)
  }, [load])

  const toggleRead = async (m: Msg) => {
    setBusyId(m.id)
    try {
      const res = await fetch(`/api/admin/messages/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !m.isRead }),
      })
      if (res.ok) {
        setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, isRead: !x.isRead } : x)))
        setCounts((c) => ({ ...c, unread: c.unread + (m.isRead ? 1 : -1) }))
      }
    } finally {
      setBusyId(null)
    }
  }

  const del = async (m: Msg) => {
    if (!window.confirm(t.admin.confirm_delete)) return
    setBusyId(m.id)
    try {
      const res = await fetch(`/api/admin/messages/${m.id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages((ms) => ms.filter((x) => x.id !== m.id))
        setCounts((c) => ({
          ...c,
          total: c.total - 1,
          unread: c.unread + (m.isRead ? 0 : -1),
        }))
      } else {
        alert(t.admin.delete_fail)
      }
    } finally {
      setBusyId(null)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/'
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const stats: [string, number, boolean][] = [
    [t.admin.st_total, counts.total, false],
    [t.admin.st_unread, counts.unread, true],
    [t.admin.st_today, counts.today, false],
    [t.admin.st_week, counts.week, false],
  ]

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <div className="admin-top">
          <div>
            <h1>
              {t.admin.title} {counts.unread > 0 && <span className="badge-dot" title={t.admin.st_unread} />}
            </h1>
            <p className="sub">
              {t.admin.sub_total}: {dig(counts.total)} · {adminName}
            </p>
          </div>
          <div className="admin-actions">
            <a href="/">← {t.admin.view_site.replace('←', '').trim()}</a>
            <button onClick={() => load()}>↻ {t.admin.refresh}</button>
            <button className="danger" onClick={logout}>
              {t.admin.logout}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map(([lbl, num, acc]) => (
            <div className="stat-card" key={lbl}>
              <div className={`num${acc ? ' acc' : ''}`}>{dig(num)}</div>
              <div className="lbl">{lbl}</div>
            </div>
          ))}
        </div>

        <BannerCard />

        <div className="toolbar">
          <div className="seg">
            {(
              [
                ['all', t.admin.f_all],
                ['unread', `${t.admin.f_unread}${counts.unread ? ` (${dig(counts.unread)})` : ''}`],
                ['read', t.admin.f_read],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                className={filter === key ? 'active' : ''}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="search">
            <input
              type="search"
              placeholder={t.admin.search_ph}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={t.admin.search_ph}
            />
          </div>
        </div>

        {err && <div className="aerr" style={{ marginBottom: 14 }}>{err}</div>}

        {loading ? (
          <div className="admin-loading">{t.admin.loading}</div>
        ) : messages.length === 0 ? (
          <div className="admin-empty">
            <div className="big">📭</div>
            {q.trim() || filter !== 'all' ? t.admin.empty_filtered : t.admin.empty}
          </div>
        ) : (
          messages.map((m) => (
            <div className={`mcard${m.isRead ? '' : ' unread'}`} key={m.id}>
              <div className="meta">
                <span className="who">
                  <b>{m.name}</b> —{' '}
                  <a href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                </span>
                <span>{fmtDate(m.createdAt)}</span>
              </div>
              <div className="subj">
                {m.subject || t.admin.no_subject}
                {!m.isRead && <span className="new">{t.admin.new_tag}</span>}
              </div>
              <div className="msg">{m.body}</div>
              <div className="acts">
                <button onClick={() => toggleRead(m)} disabled={busyId === m.id}>
                  {m.isRead ? t.admin.mark_unread : t.admin.mark_read}
                </button>
                <a className="rep" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || ''}`)}`}>
                  {t.admin.reply}
                </a>
                <button className="del" onClick={() => del(m)} disabled={busyId === m.id}>
                  {t.admin.delete}
                </button>
              </div>
            </div>
          ))
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '.78rem', marginTop: 18, opacity: 0.7 }}>
          ℹ {t.admin.acct_notice}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard({ adminName }: { adminName: string }) {
  return (
    <LangProvider>
      <TitleSync />
      <Dashboard adminName={adminName} />
    </LangProvider>
  )
}

function TitleSync() {
  const { lang } = useLang()
  useEffect(() => {
    document.title = 'Admin — WebTuly'
    document.documentElement.lang = lang
  }, [lang])
  return null
}
