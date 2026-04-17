import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5487',
  },
  webServer: [
    {
      command: 'dotnet run --project src/backend/CMMS.Api --no-build --urls http://localhost:8117',
      cwd: '../..',
      url: 'http://localhost:8117/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm.cmd run dev -- --host --port 5487',
      cwd: '../../src/frontend/cmms-web',
      url: 'http://localhost:5487',
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        VITE_API_TARGET: 'http://localhost:8117',
      },
    },
  ],
})
