import { useEffect } from 'react'

/**
 * Register the service worker in production. Silent in dev (Vite handles HMR).
 */
export function useServiceWorker() {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!('serviceWorker' in navigator)) return

    // Register on load to not block first paint.
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW registration failed — app still works, just no offline. */
      })
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])
}
