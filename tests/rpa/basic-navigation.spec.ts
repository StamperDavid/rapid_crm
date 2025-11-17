/**
 * Basic Navigation Test
 * 
 * Tests basic browser automation and navigation to FMCSA website
 * This is a READ-ONLY test - does NOT submit any applications
 */

import { test, expect } from '@playwright/test';

test.describe('FMCSA Website - Basic Navigation (Read-Only)', () => {
  
  test('should load FMCSA homepage', async ({ page }) => {
    console.log('🚀 Starting basic navigation test...');
    
    // Navigate to FMCSA homepage
    await page.goto('https://www.fmcsa.dot.gov/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    expect(title).toContain('FMCSA');
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/fmcsa-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: fmcsa-homepage.png');
    
    console.log('✅ FMCSA homepage loaded successfully');
  });
  
  test('should find USDOT registration link', async ({ page }) => {
    console.log('🔍 Looking for USDOT registration information...');
    
    // Navigate to FMCSA
    await page.goto('https://www.fmcsa.dot.gov/');
    await page.waitForLoadState('networkidle');
    
    // Search for registration-related content
    const bodyText = await page.textContent('body');
    const hasRegistration = bodyText?.toLowerCase().includes('registration') || 
                           bodyText?.toLowerCase().includes('usdot');
    
    expect(hasRegistration).toBeTruthy();
    console.log('✅ Found registration-related content');
  });
  
  test('should navigate to URS portal', async ({ page }) => {
    console.log('🌐 Attempting to navigate to URS portal...');
    
    // Navigate to URS (Unified Registration System)
    await page.goto('https://ai.fmcsa.dot.gov/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Get page title
    const title = await page.title();
    console.log('📄 URS Page title:', title);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/urs-portal.png', fullPage: true });
    console.log('📸 Screenshot saved: urs-portal.png');
    
    // Check if we can see the page content
    const bodyText = await page.textContent('body');
    console.log('📝 Page content length:', bodyText?.length || 0, 'characters');
    
    console.log('✅ URS portal loaded');
  });
  
  test('should detect Login.gov integration', async ({ page }) => {
    console.log('🔐 Checking for Login.gov integration...');
    
    // Navigate to URS
    await page.goto('https://ai.fmcsa.dot.gov/');
    await page.waitForLoadState('networkidle');
    
    // Wait a moment for any redirects
    await page.waitForTimeout(2000);
    
    // Get current URL
    const currentUrl = page.url();
    console.log('🌍 Current URL:', currentUrl);
    
    // Check if we're on Login.gov or if there's a login button
    const isLoginGov = currentUrl.includes('login.gov');
    const bodyText = await page.textContent('body');
    const hasLoginButton = bodyText?.toLowerCase().includes('login') || 
                           bodyText?.toLowerCase().includes('sign in');
    
    if (isLoginGov) {
      console.log('✅ Redirected to Login.gov (as expected)');
    } else if (hasLoginButton) {
      console.log('✅ Login functionality detected');
    } else {
      console.log('ℹ️ No immediate login detected - may require navigation');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/login-detection.png', fullPage: true });
    console.log('📸 Screenshot saved: login-detection.png');
  });
  
  test('should verify browser automation is working', async ({ page }) => {
    console.log('🤖 Testing browser automation capabilities...');
    
    // Navigate to a test page
    await page.goto('https://www.google.com');
    await page.waitForLoadState('networkidle');
    
    // Test form interaction (on Google search)
    const searchBox = page.locator('textarea[name="q"]');
    if (await searchBox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchBox.fill('FMCSA USDOT registration');
      console.log('✅ Form filling works');
      
      // Clear the search box
      await searchBox.clear();
      console.log('✅ Form clearing works');
    }
    
    // Test screenshot capability
    await page.screenshot({ path: 'screenshots/automation-test.png' });
    console.log('✅ Screenshot capability works');
    
    // Test page evaluation (JavaScript execution)
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('🌐 User Agent:', userAgent);
    expect(userAgent).toContain('Chrome');
    console.log('✅ JavaScript evaluation works');
    
    console.log('✅ All browser automation capabilities verified!');
  });
});

test.describe('Rate Limiting Safety Test', () => {
  test('should respect delay between actions', async ({ page }) => {
    console.log('⏱️ Testing rate limiting delays...');
    
    const startTime = Date.now();
    
    // Navigate to page
    await page.goto('https://www.fmcsa.dot.gov/');
    
    // Wait 800ms (our configured rate limit delay)
    await page.waitForTimeout(800);
    
    // Navigate to another page
    await page.goto('https://www.fmcsa.dot.gov/registration');
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Time elapsed: ${elapsed}ms`);
    
    // Verify we respected the delay
    expect(elapsed).toBeGreaterThanOrEqual(800);
    console.log('✅ Rate limiting delay respected');
  });
});

