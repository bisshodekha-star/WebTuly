import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

/**
 * WebTuly auth — stateless JWT session in an httpOnly cookie.
 * Works on Vercel serverless (no DB session storage needed).
 */

export type Role = 'USER' | 'ADMIN'

export interface SessionPayload {
  uid: number
  name: string
  email: string
  role: Role
}

export const SESSION_COOKIE = 'wt_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    'webtuly-dev-secret-change-me-9f2c7a1b4e8d6a3c5f0b7e2d4a9c1f8e'
  return new TextEncoder().encode(secret)
}

/** Create a signed session token. */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey())
}

/** Verify a session token; returns null when invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (
      typeof payload.uid !== 'number' ||
      typeof payload.name !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'USER' && payload.role !== 'ADMIN')
    ) {
      return null
    }
    return { uid: payload.uid, name: payload.name, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

/** Read the current session from cookies (server components & route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/** Read the current session and require the ADMIN role. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession()
  return session?.role === 'ADMIN' ? session : null
}

/** Serialize the session cookie for a Set-Cookie header. */
export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}

/** Client IP from proxy headers (Vercel/Cloudflare aware). */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim().slice(0, 60)
  return (
    headers.get('x-real-ip')?.slice(0, 60) ||
    headers.get('cf-connecting-ip')?.slice(0, 60) ||
    'unknown'
  )
}
