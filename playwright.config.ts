/**
 * Playwright Configuration for Rapid CRM RPA
 * 
 * Browser automation configuration for USDOT filing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/rpa',
  
  // Timeout settings
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },
  
  // Run tests in serial (one at a time) to avoid rate limiting
  fullyParallel: false,
  workers: 1,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for testing
    baseURL: 'https://ai.fmcsa.dot.gov',
    
    // Browser settings
    headless: false, // Show browser for debugging
    viewport: { width: 1920, height: 1080 },
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // User agent (appears as normal browser)
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  
  // Projects (browsers to test with)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // RPA-specific settings
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled', // Hide automation flags
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      },
    },
  ],
  
  // Web server (for local testing)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
});

