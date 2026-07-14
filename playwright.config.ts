import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Output artifacts (results, traces) outside the project tree so Vite's
  // dev-server file watcher does not treat them as source changes and
  // trigger HMR page reloads mid-match.
  outputDir: '/tmp/rb-e2e/test-results',
  timeout: 15 * 60 * 1000, // 15 minutes per test (3 full games run in one test)
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5176',
    viewport: { width: 375, height: 812 }, // iPhone SE portrait
    ignoreHTTPSErrors: true,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    actionTimeout: 8_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
})
