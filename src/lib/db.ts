import { PrismaClient } from '@prisma/client'

/**
 * Resolve the database URL.
 * - Production (Vercel + Neon): uses DATABASE_URL from environment (Neon pooled URL).
 * - Local sandbox: falls back to the local PostgreSQL instance when the env var
 *   is missing or still points to a file (sandbox default), so the preview always works.
 */
function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim()
  if (raw && !raw.startsWith('file:')) return raw
  // Sandbox fallback — real PostgreSQL running on 127.0.0.1:5432
  return 'postgresql://postgres@127.0.0.1:5432/postgres?schema=public&connection_limit=1'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
