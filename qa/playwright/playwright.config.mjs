import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.QA_BASE_URL || 'https://leasewild-sandbox.pages.dev';
if (!/^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev\/?$/.test(baseURL)) throw new Error('QA_BASE_URL must be a LeaseWild Cloudflare sandbox domain');
export default defineConfig({
  testDir: './tests', timeout: 60000, expect: {timeout: 10000},
  retries: process.env.CI ? 1 : 0, workers: 1, fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html',{outputFolder:'artifacts/html',open:'never'}], ['json',{outputFile:'artifacts/results.json'}], ['junit',{outputFile:'artifacts/junit.xml'}]],
  outputDir:'artifacts/test-results',
  use: {baseURL, trace:'on', screenshot:'on', video:'on', actionTimeout:15000, navigationTimeout:30000, ignoreHTTPSErrors:false},
  projects: [
    {name:'hunter-chromium',testMatch:'hunter.spec.mjs',use:{...devices['Desktop Chrome']}},
    {name:'hunter-mobile-webkit',testMatch:'hunter.spec.mjs',use:{...devices['iPhone 13']}},
    {name:'host-chromium',testMatch:'host.spec.mjs',use:{...devices['Desktop Chrome']}},
    {name:'payments-chromium',testMatch:'payments.spec.mjs',use:{...devices['Desktop Chrome']}},
    {name:'host-mobile-webkit',testMatch:'host.spec.mjs',use:{...devices['iPhone 13']}},
  ],
});
