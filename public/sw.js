const CACHE_NAME = 'zyflixa-images-v1'
const IMAGE_ORIGINS = ['image.tmdb.org', 'img1.ak.crunchyroll.com', 'cdn.myanimelist.net']
const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only cache image requests from known origins
  if (!IMAGE_ORIGINS.some((origin) => url.hostname.includes(origin))) return

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request)

      if (cached) {
        // Check if cache is still fresh
        const cachedDate = cached.headers.get('x-cached-at')
        if (cachedDate && Date.now() - Number(cachedDate) < MAX_AGE) {
          return cached
        }
      }

      // Fetch fresh copy
      try {
        const response = await fetch(e.request)
        if (response.ok) {
          // Clone and add timestamp header
          const headers = new Headers(response.headers)
          headers.set('x-cached-at', String(Date.now()))
          const cachedResponse = new Response(await response.blob(), {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
          cache.put(e.request, cachedResponse.clone())
          return cachedResponse
        }
        return response
      } catch {
        // Network failed — return cached even if stale
        return cached || new Response('', { status: 503 })
      }
    })
  )
})
