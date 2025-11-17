/**
 * LiveUSDOTRPAService
 * 
 * Uses Playwright to control a real browser and file USDOT applications
 * on the actual FMCSA website (not the training environment)
 * 
 * This service provides real-time monitoring and step-by-step execution
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface RPAConfig {
  headless: boolean;
  viewport: { width: number; height: number };
  slowMo: number; // Delay between actions in ms
  screenshotsEnabled: boolean;
  screenshotPath: string;
}

interface Credentials {
  loginGovEmail: string;
  loginGovPassword: string;
  mfaMethod: 'sms' | 'authenticator';
  mfaPhone?: string;
}

interface RPAStatus {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentPage: number;
  totalPages: number;
  currentAction: string;
  lastScreenshot?: string;
  errors: string[];
  startTime?: string;
  endTime?: string;
}

export class LiveUSDOTRPAService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private context: BrowserContext | null = null;
  private config: RPAConfig;
  private status: RPAStatus;
  private statusCallbacks: ((status: RPAStatus) => void)[] = [];
  
  constructor(config?: Partial<RPAConfig>) {
    this.config = {
      headless: false, // Always show browser for monitoring
      viewport: { width: 1920, height: 1080 },
      slowMo: 800, // 800ms delay between actions (rate limiting)
      screenshotsEnabled: true,
      screenshotPath: './storage/screenshots/',
      ...config
    };
    
    this.status = {
      status: 'idle',
      currentPage: 0,
      totalPages: 77,
      currentAction: 'Initializing...',
      errors: []
    };
  }
  
  /**
   * Register a callback to receive status updates
   */
  onStatusUpdate(callback: (status: RPAStatus) => void): void {
    this.statusCallbacks.push(callback);
  }
  
  /**
   * Update status and notify all listeners
   */
  private updateStatus(updates: Partial<RPAStatus>): void {
    this.status = { ...this.status, ...updates };
    this.statusCallbacks.forEach(callback => callback(this.status));
  }
  
  /**
   * Initialize browser and create new context
   */
  async initialize(): Promise<void> {
    try {
      this.updateStatus({ currentAction: 'Launching browser...' });
      
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        args: [
          '--disable-blink-features=AutomationControlled', // Hide automation
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ]
      });
      
      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      this.page = await this.context.newPage();
      
      // Set up page event listeners
      this.page.on('console', msg => {
        console.log('[Browser Console]:', msg.text());
      });
      
      this.page.on('pageerror', error => {
        console.error('[Browser Error]:', error);
        this.status.errors.push(error.message);
      });
      
      this.updateStatus({ 
        status: 'idle',
        currentAction: 'Browser ready'
      });
      
      console.log('✅ LiveUSDOTRPAService initialized');
    } catch (error) {
      this.updateStatus({ 
        status: 'failed',
        currentAction: 'Failed to initialize browser'
      });
      throw error;
    }
  }
  
  /**
   * Navigate to FMCSA URS portal
   */
  async navigateToFMCSA(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      this.updateStatus({ currentAction: 'Navigating to FMCSA URS portal...' });
      
      await this.page.goto('https://ai.fmcsa.dot.gov/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      await this.takeScreenshot('fmcsa-portal');
      
      this.updateStatus({ currentAction: 'FMCSA portal loaded' });
      
      console.log('✅ Navigated to FMCSA portal');
    } catch (error) {
      this.handleError('Failed to navigate to FMCSA', error);
      throw error;
    }
  }
  
  /**
   * Login to Login.gov (with MFA checkpoint)
   */
  async loginToLoginGov(credentials: Credentials): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      this.updateStatus({ currentAction: 'Logging in to Login.gov...' });
      
      // Wait for Login.gov redirect (if not already there)
      const currentUrl = this.page.url();
      if (!currentUrl.includes('login.gov')) {
        // Look for login button
        await this.page.click('button:has-text("Sign in")').catch(() => {
          return this.page.click('a:has-text("Sign in")');
        });
        
        await this.page.waitForURL('**/login.gov/**', { timeout: 10000 });
      }
      
      await this.takeScreenshot('login-gov-page');
      
      // Fill in email
      await this.page.fill('input[type="email"]', credentials.loginGovEmail);
      await this.page.click('button[type="submit"]');
      
      await this.delay(1000);
      
      // Fill in password
      await this.page.fill('input[type="password"]', credentials.loginGovPassword);
      await this.page.click('button[type="submit"]');
      
      await this.takeScreenshot('after-password-submit');
      
      // MFA Checkpoint
      this.updateStatus({ 
        status: 'paused',
        currentAction: 'Waiting for MFA code...'
      });
      
      console.log('⏸️ RPA PAUSED: Waiting for admin to complete MFA');
      console.log('👤 Admin must enter MFA code to continue');
      
      // Wait for admin to manually complete MFA
      // In production, this would send a notification to admin
      // For now, just wait for the page to change
      await this.page.waitForURL('**/fmcsa.dot.gov/**', { timeout: 300000 }); // 5 min timeout
      
      this.updateStatus({ 
        status: 'running',
        currentAction: 'MFA completed, continuing...'
      });
      
      await this.takeScreenshot('after-mfa');
      
      console.log('✅ Login successful');
    } catch (error) {
      this.handleError('Login failed', error);
      throw error;
    }
  }
  
  /**
   * Fill a form field with rate limiting
   */
  async fillField(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.fill(selector, value);
      
      // Rate limiting delay
      await this.delay(this.config.slowMo);
    } catch (error) {
      this.handleError(`Failed to fill field: ${selector}`, error);
      throw error;
    }
  }
  
  /**
   * Click an element with rate limiting
   */
  async clickElement(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.click(selector);
      
      // Rate limiting delay
      await this.delay(this.config.slowMo);
    } catch (error) {
      this.handleError(`Failed to click element: ${selector}`, error);
      throw error;
    }
  }
  
  /**
   * Navigate to next page
   */
  async navigateNext(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    try {
      this.updateStatus({ currentAction: 'Navigating to next page...' });
      
      // Click next button (adjust selector based on FMCSA site)
      await this.clickElement('button:has-text("Next")');
      
      // Wait for page load
      await this.page.waitForLoadState('networkidle');
      
      // Update page counter
      this.updateStatus({ 
        currentPage: this.status.currentPage + 1,
        currentAction: `Page ${this.status.currentPage + 1} of ${this.status.totalPages}`
      });
      
      await this.takeScreenshot(`page-${this.status.currentPage}`);
      
      // Rate limiting between pages
      await this.delay(2000);
    } catch (error) {
      this.handleError('Failed to navigate to next page', error);
      throw error;
    }
  }
  
  /**
   * Take screenshot
   */
  private async takeScreenshot(name: string): Promise<void> {
    if (!this.page || !this.config.screenshotsEnabled) return;
    
    try {
      const path = `${this.config.screenshotPath}${name}_${Date.now()}.png`;
      await this.page.screenshot({ path, fullPage: true });
      this.status.lastScreenshot = path;
      console.log(`📸 Screenshot saved: ${path}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }
  
  /**
   * Delay helper
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    console.error(`❌ ${message}:`, error);
    this.status.errors.push(`${message}: ${error.message}`);
    this.updateStatus({ 
      status: 'failed',
      currentAction: message
    });
  }
  
  /**
   * Get current status
   */
  getStatus(): RPAStatus {
    return { ...this.status };
  }
  
  /**
   * Pause execution
   */
  pause(): void {
    this.updateStatus({ 
      status: 'paused',
      currentAction: 'Paused by user'
    });
  }
  
  /**
   * Resume execution
   */
  resume(): void {
    this.updateStatus({ 
      status: 'running',
      currentAction: 'Resuming...'
    });
  }
  
  /**
   * Get screenshot of current page
   */
  async getCurrentScreenshot(): Promise<Buffer | null> {
    if (!this.page) return null;
    
    try {
      return await this.page.screenshot({ fullPage: true });
    } catch (error) {
      console.error('Failed to get screenshot:', error);
      return null;
    }
  }
  
  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      
      this.page = null;
      this.context = null;
      this.browser = null;
      
      this.updateStatus({ 
        status: 'idle',
        currentAction: 'Browser closed'
      });
      
      console.log('✅ LiveUSDOTRPAService closed');
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

export default LiveUSDOTRPAService;

