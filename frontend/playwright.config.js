import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
  },
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
