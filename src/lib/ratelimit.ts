/**
 * Tiny in-memory sliding-window rate limiter.
 * Works per serverless instance; the contact route additionally enforces a
 * database-level limit per IP (accurate across instances), like the original PHP.
 */
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)

  // opportunistic cleanup to keep memory flat
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
    }
  }
  return true
}
