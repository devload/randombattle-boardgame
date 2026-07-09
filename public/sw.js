/**
 * RandomBattle service worker.
 *
 * Cache-first for static assets, network-first for HTML (so we always get
 * a fresh app shell when online). Fully replaces itself on new versions.
 */

const CACHE_VERSION = 'v1'
const STATIC_CACHE = `rb-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `rb-runtime-${CACHE_VERSION}`

const APP_SHELL = [
  '/',
  '/index.html',
  '/manual/',
  '/manual/index.html',
  '/manual/style.css',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {/* ignore missing */})
        )
      )
    ).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.endsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  const isHTML = req.headers.get('accept')?.includes('text/html')

  if (isHTML) {
    // Network-first for HTML: fresh app shell online, fall back to cache offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone()
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone))
          return res
        })
        .catch(() => caches.match(req).then((c) => c ?? caches.match('/')))
    )
    return
  }

  // Cache-first for hashed assets.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone))
        }
        return res
      })
    })
  )
})
