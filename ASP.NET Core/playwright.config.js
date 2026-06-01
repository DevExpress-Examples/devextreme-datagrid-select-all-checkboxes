const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'https://localhost:57199',
    ignoreHTTPSErrors: true,
    headless: true,
  },
  webServer: {
    command: 'dotnet run --urls=https://localhost:57199',
    url: 'https://localhost:57199',
    ignoreHTTPSErrors: true,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
