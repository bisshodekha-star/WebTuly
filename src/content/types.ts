/** Shared shape for bn/en site content. */
export interface SiteContent {
  meta_title: string
  meta_desc: string

  nav: {
    home: string
    about: string
    skills: string
    services: string
    projects: string
    experience: string
    cta: string
    switch_to: string
    switch_title: string
    login: string
    signup: string
    logout: string
    hello: string
  }

  hero: {
    badge: string
    h1_pre: string
    h1_line2: string
    phrases: string[]
    tagline: string
    btn_work: string
    btn_contact: string
    stats: [string, string][]
    code_role: string
    code_comment: string
    code_arg: string
  }

  about: {
    kicker: string
    h2: string
    p: string
    role: string
    facts: [string, string][]
    h3: string
    p1: string
    p2: string
    checks: string[]
    btn: string
  }

  skills: {
    kicker: string
    h2: string
    p: string
    blocks: { title: string; items: [string, number][] }[]
  }

  services: {
    kicker: string
    h2: string
    p: string
    items: [string, string, string][]
  }

  projects: {
    kicker: string
    h2: string
    p: string
    filters: Record<string, string>
    items: [string, string, string, string, string, string, string[]][]
  }

  experience: {
    kicker: string
    h2: string
    p: string
    items: [string, string, string, string][]
  }

  contact: {
    kicker: string
    h2: string
    p: string
    email_lbl: string
    email_val: string
    phone_lbl: string
    phone_val: string
    loc_lbl: string
    loc_val: string
    f_name: string
    f_email: string
    f_subject: string
    f_message: string
    ph_name: string
    ph_subject: string
    ph_message: string
    e_name: string
    e_email: string
    e_subject: string
    e_message: string
    btn_send: string
    btn_sending: string
    msg_ok: string
    msg_fail: string
    msg_net: string
  }

  footer: {
    made: string
    home: string
    projects: string
    contact: string
  }

  auth: {
    login_title: string
    login_sub: string
    login_btn: string
    login_fail: string
    to_signup: string
    to_login_q: string
    signup_title: string
    signup_sub: string
    signup_btn: string
    signup_fail: string
    f_name: string
    f_email: string
    f_password: string
    f_confirm: string
    ph_name: string
    ph_email: string
    ph_password: string
    ph_confirm: string
    e_name: string
    e_email: string
    e_password: string
    e_confirm: string
    e_email_exists: string
    pw_hint: string
    pw_weak: string
    pw_ok: string
    pw_strong: string
    working: string
    welcome: string
  }

  admin: {
    title: string
    sub_total: string
    login_title: string
    login_sub: string
    login_btn: string
    login_fail: string
    no_admin_hint: string
    setup_title: string
    setup_sub: string
    setup_btn: string
    setup_done: string
    setup_key: string
    logout: string
    view_site: string
    refresh: string
    st_total: string
    st_unread: string
    st_today: string
    st_week: string
    f_all: string
    f_unread: string
    f_read: string
    search_ph: string
    mark_read: string
    mark_unread: string
    reply: string
    delete: string
    confirm_delete: string
    empty: string
    empty_filtered: string
    loading: string
    no_subject: string
    new_tag: string
    acct_notice: string
    delete_fail: string
  }

  api: {
    method: string
    rate: string
    fields: string
    server: string
  }
}
