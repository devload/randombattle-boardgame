import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite's file watcher walks the whole project tree. Without an
    // explicit ignore list, Playwright screenshot writes under
    // `e2e/screenshots/` and edits to `docs/` can trigger an HMR update
    // that fails (non-HMR-safe change) and falls back to a **full page
    // reload** — which resets the app to the Lobby scene mid-match.
    // That was the root cause of the E2E JUMPED-TO-LOBBY reports.
    watch: {
      ignored: [
        '**/e2e/**',
        '**/docs/**',
        '**/mockups/**',
        '**/test-results/**',
      ],
    },
  },
  // Vitest picks up this file too — exclude the Playwright e2e tests
  // from the unit-test run so `npm test` stays green.
  test: {
    exclude: ['node_modules', 'dist', '.git', 'e2e/**'],
  },
})
