'use client'

import { useCallback, useEffect, useState } from 'react'
import { LangProvider, useLang } from '@/content'
import TypedText from './TypedText'
import StatCounter from './StatCounter'
import SkillBar from './SkillBar'

interface Me {
  uid: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Portfolio() {
  const { lang, setLang, toggle, t, dig } = useLang()
  const other = lang === 'bn' ? 'en' : 'bn'

  /* ---------- UI state ---------- */
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [showTop, setShowTop] = useState(false)
  const [filter, setFilter] = useState('all')

  /* ---------- Auth state ---------- */
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    let on = true
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (on && d?.user) setMe(d.user)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setMe(null)
    }
  }, [])

  /* ---------- Meta: React 19 owns <title>/meta — rendered with current lang ---------- */
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  /* ---------- Support ?lang=bn|en links (same as the old PHP site) ---------- */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('lang')
    if (p === 'bn' || p === 'en') {
      const m = document.cookie.match(/(?:^|;\s*)wt_lang=(bn|en)/)
      if (!m || m[1] !== p) setLang(p)
    }
  }, [])

  /* ---------- Scroll listeners: navbar, active section, to-top ---------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
      setShowTop(window.scrollY > 500)
      let current = ''
      document.querySelectorAll<HTMLElement>('section[id]').forEach((s) => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id
      })
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---------- Reveal on scroll (runs once; DOM nodes persist) ---------- */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])



  const navItems: [string, string][] = [
    ['home', t.nav.home],
    ['about', t.nav.about],
    ['skills', t.nav.skills],
    ['services', t.nav.services],
    ['projects', t.nav.projects],
    ['experience', t.nav.experience],
  ]

  return (
    <>
      {/* Document metadata follows the selected language (hoisted by React 19) */}
      <title>{t.meta_title}</title>
      <meta name="description" content={t.meta_desc} />

      {/* ================= BANNER VIDEO (admin-managed) ================= */}
      <VideoBanner />

      {/* ================= NAVBAR ================= */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-inner">
          <a className="logo" href="#home">
            <span className="mark">&lt;/&gt;</span>
            <span>
              WebTuly<span className="dot">.</span>
            </span>
          </a>

          <nav className={`nav-links${menuOpen ? ' open' : ''}`} id="navLinks">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeId === id ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
              {t.nav.cta}
            </a>

            {/* shown only inside the mobile dropdown */}
            <span className="m-only m-sep" aria-hidden="true" />
            {me ? (
              <>
                {me.role === 'ADMIN' && (
                  <a className="m-only" href="/admin" onClick={() => setMenuOpen(false)}>
                    📥 Admin
                  </a>
                )}
                <a className="m-only" href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); logout() }}>
                  ⎋ {t.nav.logout}
                </a>
              </>
            ) : (
              <>
                <a className="m-only" href="/login" onClick={() => setMenuOpen(false)}>
                  👤 {t.nav.login}
                </a>
                <a className="m-only mob-signup" href="/signup" onClick={() => setMenuOpen(false)}>
                  ✨ {t.nav.signup}
                </a>
              </>
            )}
          </nav>

          <div className="nav-right">
            {me ? (
              <div className="nav-user">
                <span className="uname">
                  {t.nav.hello}, {me.name}
                </span>
                {me.role === 'ADMIN' && (
                  <a className="ulink" href="/admin" title="Admin">
                    📥
                  </a>
                )}
                <button
                  className="ulink"
                  onClick={logout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  title={t.nav.logout}
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <a className="auth-login" href="/login">
                  {t.nav.login}
                </a>
                <a className="auth-signup" href="/signup">
                  {t.nav.signup}
                </a>
              </div>
            )}

            <button
              className="lang-switch"
              onClick={() => setLang(other)}
              title={t.nav.switch_title}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              🌐 {t.nav.switch_to}
            </button>
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div>
            <span className="hero-badge">{t.hero.badge}</span>
            <h1>
              {t.hero.h1_pre} <span className="grad">WebTuly</span>
              <br />
              {t.hero.h1_line2}
            </h1>
            <p className="tagline">
              <TypedText phrases={t.hero.phrases} key={lang} />
              <br />
              {t.hero.tagline}
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                {t.hero.btn_work}
              </a>
              <a href="#contact" className="btn btn-ghost">
                {t.hero.btn_contact}
              </a>
            </div>

            <div className="hero-stats">
              {t.hero.stats.map(([num, label]) => (
                <div className="stat" key={label}>
                  <div className="num">
                    <StatCounter target={parseInt(num, 10)} />+
                  </div>
                  <div className="lbl">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-3d">
            <div className="code-card">
              <div className="bar">
                <i></i>
                <i></i>
                <i></i>
                <span>developer.js</span>
              </div>
              <pre>
                <span className="ln">1</span><span className="kw">const</span> <span className="var">developer</span> = {'{'}
                {'\n'}
                <span className="ln">2</span>{'  '}<span className="var">name</span>: <span className="str">&apos;WebTuly&apos;</span>,
                {'\n'}
                <span className="ln">3</span>{'  '}<span className="var">role</span>: <span className="str">&apos;{t.hero.code_role}&apos;</span>,
                {'\n'}
                <span className="ln">4</span>{'  '}<span className="var">skills</span>: [<span className="str">&apos;HTML&apos;</span>, <span className="str">&apos;CSS&apos;</span>, <span className="str">&apos;JS&apos;</span>, <span className="str">&apos;PHP&apos;</span>],
                {'\n'}
                <span className="ln">5</span>{'  '}<span className="fn">buildWebsite</span>(<span className="var">idea</span>) {'{'}
                {'\n'}
                <span className="ln">6</span>{'    '}<span className="kw">return</span> <span className="var">idea</span> + <span className="str">&apos; ✨ + clean code&apos;</span>;
                {'\n'}
                <span className="ln">7</span>{'  '}
                {'}'}
                {'\n'}
                <span className="ln">8</span>
                {'}'};
                {'\n'}
                <span className="ln">9</span>
                {'\n'}
                <span className="ln">10</span><span className="cm">{t.hero.code_comment}</span>
                {'\n'}
                <span className="ln">11</span><span className="var">developer</span>.<span className="fn">buildWebsite</span>(<span className="str">&apos;{t.hero.code_arg}&apos;</span>);
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">{t.about.kicker}</span>
            <h2>{t.about.h2}</h2>
            <p>{t.about.p}</p>
          </div>

          <div className="about-grid">
            <div className="about-card reveal">
              <div className="avatar">&lt;/&gt;</div>
              <h3>WebTuly</h3>
              <div className="role">{t.about.role}</div>

              <div className="about-facts">
                {t.about.facts.map(([k, v]) => (
                  <div className="fact" key={k}>
                    <b>{k}</b>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="about-text reveal">
              <h3>{t.about.h3}</h3>
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>

              <ul className="about-checks">
                {t.about.checks.map((c) => (
                  <li key={c}>
                    <span className="tick">✓</span> {c}
                  </li>
                ))}
              </ul>

              <a href="#contact" className="btn btn-primary">
                {t.about.btn}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SKILLS ================= */}
      <section id="skills">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">{t.skills.kicker}</span>
            <h2>{t.skills.h2}</h2>
            <p>{t.skills.p}</p>
          </div>

          <div className="skills-grid">
            {t.skills.blocks.map((block) => (
              <div className="skill-block reveal" key={block.title}>
                <h4>{block.title}</h4>
                {block.items.map(([name, level]) => (
                  <SkillBar name={name} level={level} key={name} />
                ))}
              </div>
            ))}
          </div>

          <div className="tags reveal">
            {['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'SQLite', 'jQuery', 'Bootstrap', 'Tailwind', 'Git', 'GitHub', 'REST API', 'Figma to Code', 'PSD to HTML', 'SEO Basics'].map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">{t.services.kicker}</span>
            <h2>{t.services.h2}</h2>
            <p>{t.services.p}</p>
          </div>

          <div className="services-grid">
            {t.services.items.map(([ico, title, desc]) => (
              <div className="service reveal" key={title}>
                <div className="ico">{ico}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROJECTS ================= */}
      <section id="projects">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">{t.projects.kicker}</span>
            <h2>{t.projects.h2}</h2>
            <p>{t.projects.p}</p>
          </div>

          <div className="filters reveal">
            {Object.entries(t.projects.filters).map(([key, label]) => (
              <button
                key={key}
                className={`filter-btn${filter === key ? ' active' : ''}`}
                data-filter={key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {t.projects.items.map(([cat, thumb, abbr, catLabel, title, desc, stack]) => (
              <article
                className={`project reveal${filter !== 'all' && filter !== cat ? ' hidden' : ''}`}
                data-cat={cat}
                key={title}
              >
                <div className={`thumb ${thumb}`}>{abbr}</div>
                <div className="body">
                  <span className="cat">{catLabel}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <div className="stack">
                    {stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section id="experience">
        <div className="container">
          <div className="section-head reveal">
            <span className="kicker">{t.experience.kicker}</span>
            <h2>{t.experience.h2}</h2>
            <p>{t.experience.p}</p>
          </div>

          <div className="timeline">
            {t.experience.items.map(([date, title, org, desc]) => (
              <div className="tl-item reveal" key={title}>
                <span className="tl-date">{date}</span>
                <h3>{title}</h3>
                <span className="org">{org}</span>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <ContactSection />

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="container foot-inner">
          <p>
            © {dig(new Date().getFullYear())} WebTuly. {t.footer.made}
          </p>
          <div className="foot-links">
            <a href="#home">{t.footer.home}</a>
            <a href="#projects">{t.footer.projects}</a>
            <a href="#contact">{t.footer.contact}</a>
            <a href="/admin" className="admin-link" title="Admin panel">
              Admin
            </a>
          </div>
        </div>
      </footer>

      <button
        className={`to-top${showTop ? ' show' : ''}`}
        aria-label="Top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: 'none' }}
      >
        ↑
      </button>
    </>
  )
}

/* ================= CONTACT SECTION (form → /api/contact) ================= */
function ContactSection() {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'fail' | ''; msg: string }>({ kind: '', msg: '' })
  const [sending, setSending] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: false }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const bad: Record<string, boolean> = {
      name: !form.name.trim() || form.name.length > 80,
      email: !EMAIL_RE.test(form.email),
      subject: !form.subject.trim() || form.subject.length > 120,
      message: form.message.trim().length < 5 || form.message.length > 3000,
    }
    setErrors(bad)
    if (Object.values(bad).some(Boolean)) return

    setSending(true)
    setStatus({ kind: '', msg: '' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatus({ kind: 'ok', msg: t.contact.msg_ok })
        setForm({ name: '', email: '', subject: '', message: '', website: '' })
      } else {
        setStatus({ kind: 'fail', msg: data.error || t.contact.msg_fail })
      }
    } catch {
      setStatus({ kind: 'fail', msg: t.contact.msg_net })
    } finally {
      setSending(false)
    }
  }

  const fieldCls = (k: string) => `field${errors[k] ? ' invalid' : ''}`

  return (
    <section id="contact">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">{t.contact.kicker}</span>
          <h2>{t.contact.h2}</h2>
          <p>{t.contact.p}</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info reveal">
            <div className="ci">
              <div className="ico">📧</div>
              <div>
                <b>{t.contact.email_lbl}</b>
                <span>
                  <a href={`mailto:${t.contact.email_val}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {t.contact.email_val}
                  </a>
                </span>
              </div>
            </div>
            <div className="ci">
              <div className="ico">📞</div>
              <div>
                <b>{t.contact.phone_lbl}</b>
                <span>{t.contact.phone_val}</span>
              </div>
            </div>
            <div className="ci">
              <div className="ico">📍</div>
              <div>
                <b>{t.contact.loc_lbl}</b>
                <span>{t.contact.loc_val}</span>
              </div>
            </div>

            <div className="socials">
              <a href="#" aria-label="GitHub" title="GitHub">
                GH
              </a>
              <a href="#" aria-label="LinkedIn" title="LinkedIn">
                IN
              </a>
              <a href="#" aria-label="Facebook" title="Facebook">
                FB
              </a>
              <a href="#" aria-label="Twitter / X" title="Twitter / X">
                X
              </a>
            </div>
          </div>

          <form className="contact-form reveal" onSubmit={submit} noValidate>
            <div className={`form-status${status.kind ? ` ${status.kind}` : ''}`} role="status">
              {status.msg}
            </div>

            {/* honeypot — invisible to humans, catnip for bots */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={set('website')}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
            />

            <div className="form-row">
              <div className={fieldCls('name')}>
                <label htmlFor="f-name">{t.contact.f_name}</label>
                <input
                  type="text"
                  id="f-name"
                  name="name"
                  placeholder={t.contact.ph_name}
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={set('name')}
                />
                <span className="err">{t.contact.e_name}</span>
              </div>
              <div className={fieldCls('email')}>
                <label htmlFor="f-email">{t.contact.f_email}</label>
                <input
                  type="email"
                  id="f-email"
                  name="email"
                  placeholder="example@mail.com"
                  required
                  value={form.email}
                  onChange={set('email')}
                />
                <span className="err">{t.contact.e_email}</span>
              </div>
            </div>

            <div className={fieldCls('subject')}>
              <label htmlFor="f-subject">{t.contact.f_subject}</label>
              <input
                type="text"
                id="f-subject"
                name="subject"
                placeholder={t.contact.ph_subject}
                required
                maxLength={120}
                value={form.subject}
                onChange={set('subject')}
              />
              <span className="err">{t.contact.e_subject}</span>
            </div>

            <div className={fieldCls('message')}>
              <label htmlFor="f-message">{t.contact.f_message}</label>
              <textarea
                id="f-message"
                name="message"
                placeholder={t.contact.ph_message}
                required
                maxLength={3000}
                value={form.message}
                onChange={set('message')}
              />
              <span className="err">{t.contact.e_message}</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
              {sending ? t.contact.btn_sending : t.contact.btn_send}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ================= VIDEO BANNER (admin-managed, 1200×500) ================= */

/** Extract the video id from any common YouTube link shape, or null. */
function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,20})/
  )
  return m ? m[1] : null
}

/** Extract the video id from a Vimeo link, or null. */
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d{6,12})/)
  return m ? m[1] : null
}

function VideoBanner() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let on = true
    fetch('/api/banner')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (on && d?.ok && d.videoUrl) setUrl(d.videoUrl)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  if (!url) return null

  const yt = youtubeId(url)
  const vm = vimeoId(url)

  return (
    <section className="video-banner-wrap" aria-label="ব্যানার ভিডিও">
      <div className="container">
        <div className="video-banner">
          {yt ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=1&rel=0&modestbranding=1&playsinline=1`}
              title="Banner video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : vm ? (
            <iframe
              src={`https://player.vimeo.com/video/${vm}?autoplay=1&muted=1&loop=1&background=1`}
              title="Banner video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            /* direct video file (mp4 / webm) — muted autoplay loops like a banner */
            <video src={url} autoPlay muted loop playsInline preload="metadata" />
          )}
        </div>
      </div>
    </section>
  )
}

export default function PortfolioPage() {
  return (
    <LangProvider>
      <Portfolio />
    </LangProvider>
  )
}
