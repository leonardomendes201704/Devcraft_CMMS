import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: 'dotnet run --project src/backend/CMMS.Api --no-build --urls http://localhost:5270',
      cwd: '../..',
      url: 'http://localhost:5270/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm.cmd run dev -- --host',
      cwd: '../../src/frontend/cmms-web',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        VITE_API_TARGET: 'http://localhost:5270',
      },
    },
  ],
})
