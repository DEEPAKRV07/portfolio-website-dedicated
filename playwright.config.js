import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.js', timeout: 45000, fullyParallel: false, workers: 1,
  expect: { timeout: 10000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173/portfolio-website-dedicated/', reuseExistingServer: !process.env.CI, timeout: 30000 },
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/portfolio-website-dedicated/', channel: process.env.CI ? undefined : 'msedge', headless: true, viewport: { width: 1440, height: 960 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' }
});
