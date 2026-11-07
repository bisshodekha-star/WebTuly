/* ============================================================
   WebTuly service worker — minimal & safe.
   Purpose: make the site installable as an app (PWA).
   Strategy: pure network pass-through — no caching, so users
   NEVER see stale pages after a deploy.
   ============================================================ */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // remove any caches left by older service workers
      if (self.caches) {
        const names = await caches.keys()
        await Promise.all(names.map((n) => caches.delete(n)))
      }
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // pass-through: browser HTTP cache still applies, nothing is stored by us
  event.respondWith(fetch(req))
})
