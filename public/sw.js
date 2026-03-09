// A minimal service-worker placeholder to prevent 404

self.addEventListener('install', event => {
  // Skip waiting so this SW activates immediately
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Claim clients so page reload not required
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // No-op: let all requests pass through
})
