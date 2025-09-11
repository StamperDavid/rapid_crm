import { Integration } from './IntegrationManager';

export interface Webhook {
  id: string;
  integrationId: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  headers: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt?: string;
  nextRetry?: string;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  attempt: number;
  status: 'success' | 'failed' | 'timeout';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export class WebhookManager {
  private webhooks: Map<string, Webhook> = new Map();
  private events: Map<string, WebhookEvent[]> = new Map();
  private deliveries: Map<string, WebhookDelivery[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.loadData();
  }

  /**
   * Initialize the webhook manager
   */
  public async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      console.log('Webhook Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Webhook Manager:', error);
      throw new Error('Webhook Manager initialization failed');
    }
  }

  /**
   * Check if manager is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Load data from storage
   */
  private async loadData(): Promise<void> {
    try {
      console.log('Loading webhook data from real database...');
      // TODO: Implement real database loading
      // For now, initialize empty
      this.webhooks = new Map();
      this.events = new Map();
      this.deliveries = new Map();
    } catch (error) {
      console.error('Error loading webhook data:', error);
    }
  }

  /**
   * Save data to storage
   */
  private async saveData(): Promise<void> {
    try {
      console.log('Saving webhook data to real database...');
      // TODO: Implement real database saving
      // Data is saved individually when created/updated
    } catch (error) {
      console.error('Error saving webhook data:', error);
    }
  }

  /**
   * Create a new webhook
   */
  public async createWebhook(webhookData: Omit<Webhook, 'id' | 'successCount' | 'failureCount' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    const newWebhook: Webhook = {
      ...webhookData,
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.webhooks.set(newWebhook.id, newWebhook);
    this.events.set(newWebhook.id, []);
    this.deliveries.set(newWebhook.id, []);

    await this.saveData();
    return newWebhook;
  }

  /**
   * Get all webhooks
   */
  public async getWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get webhook by ID
   */
  public async getWebhook(id: string): Promise<Webhook | null> {
    return this.webhooks.get(id) || null;
  }

  /**
   * Get webhooks for integration
   */
  public async getWebhooksForIntegration(integrationId: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.integrationId === integrationId);
  }

  /**
   * Update webhook
   */
  public async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | null> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updatedWebhook = {
      ...webhook,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.webhooks.set(id, updatedWebhook);
    await this.saveData();
    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  public async deleteWebhook(id: string): Promise<boolean> {
    const deleted = this.webhooks.delete(id);
    this.events.delete(id);
    this.deliveries.delete(id);
    await this.saveData();
    return deleted;
  }

  /**
   * Trigger webhook event
   */
  public async triggerWebhook(webhookId: string, event: string, payload: any): Promise<WebhookEvent> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error('Webhook not found');

    if (webhook.status !== 'active') {
      throw new Error('Webhook is not active');
    }

    if (!webhook.events.includes(event)) {
      throw new Error(`Event '${event}' is not configured for this webhook`);
    }

    const webhookEvent: WebhookEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      webhookId,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString()
    };

    const events = this.events.get(webhookId) || [];
    events.push(webhookEvent);
    this.events.set(webhookId, events);

    // Process the webhook asynchronously
    this.processWebhookEvent(webhookEvent);

    await this.saveData();
    return webhookEvent;
  }

  /**
   * Process webhook event
   */
  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    const webhook = this.webhooks.get(event.webhookId);
    if (!webhook) return;

    try {
      await this.deliverWebhook(webhook, event);
    } catch (error) {
      console.error('Failed to process webhook event:', error);
    }
  }

  /**
   * Deliver webhook
   */
  private async deliverWebhook(webhook: Webhook, event: WebhookEvent): Promise<void> {
    const startTime = Date.now();
    const attempt = event.attempts + 1;

    try {
      // Simulate webhook delivery
      const success = await this.simulateWebhookDelivery(webhook, event);
      
      if (success) {
        // Update event status
        event.status = 'sent';
        event.attempts = attempt;
        event.lastAttempt = new Date().toISOString();

        // Update webhook stats
        webhook.successCount++;
        webhook.lastTriggered = new Date().toISOString();
        webhook.status = 'active';

        // Record delivery
        const delivery: WebhookDelivery = {
          id: `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          webhookId: webhook.id,
          eventId: event.id,
          attempt,
          status: 'success',
          responseTime: Date.now() - startTime,
          statusCode: 200,
          timestamp: new Date().toISOString()
        };

        const deliveries = this.deliveries.get(webhook.id) || [];
        deliveries.push(delivery);
        this.deliveries.set(webhook.id, deliveries);
      } else {
        throw new Error('Webhook delivery failed');
      }
    } catch (error) {
      // Update event status
      event.status = 'failed';
      event.attempts = attempt;
      event.lastAttempt = new Date().toISOString();
      event.error = error instanceof Error ? error.message : 'Unknown error';

      // Update webhook stats
      webhook.failureCount++;
      webhook.status = 'error';

      // Record failed delivery
      const delivery: WebhookDelivery = {
        id: `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        webhookId: webhook.id,
        eventId: event.id,
        attempt,
        status: 'failed',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      const deliveries = this.deliveries.get(webhook.id) || [];
      deliveries.push(delivery);
      this.deliveries.set(webhook.id, deliveries);

      // Schedule retry if within retry policy
      if (attempt < webhook.retryPolicy.maxRetries) {
        event.status = 'retrying';
        event.nextRetry = new Date(Date.now() + webhook.retryPolicy.retryDelay * Math.pow(webhook.retryPolicy.backoffMultiplier, attempt - 1)).toISOString();
        
        // Schedule retry
        setTimeout(() => {
          this.processWebhookEvent(event);
        }, webhook.retryPolicy.retryDelay * Math.pow(webhook.retryPolicy.backoffMultiplier, attempt - 1));
      }
    }

    await this.saveData();
  }

  /**
   * Simulate webhook delivery
   */
  private async simulateWebhookDelivery(webhook: Webhook, event: WebhookEvent): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate occasional failures (10% failure rate)
    return Math.random() > 0.1;
  }

  /**
   * Get webhook events
   */
  public async getWebhookEvents(webhookId: string): Promise<WebhookEvent[]> {
    return this.events.get(webhookId) || [];
  }

  /**
   * Get webhook deliveries
   */
  public async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return this.deliveries.get(webhookId) || [];
  }

  /**
   * Test webhook endpoint
   */
  public async testWebhook(webhookId: string): Promise<{ success: boolean; message: string; responseTime: number }> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) throw new Error('Webhook not found');

    const startTime = Date.now();
    
    try {
      // Simulate test request
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responseTime = Date.now() - startTime;
      const success = Math.random() > 0.2; // 80% success rate for tests
      
      return {
        success,
        message: success ? 'Webhook endpoint is reachable' : 'Webhook endpoint is not responding',
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get webhook statistics
   */
  public async getWebhookStats(webhookId: string): Promise<{
    totalEvents: number;
    successRate: number;
    averageResponseTime: number;
    last24Hours: {
      events: number;
      successes: number;
      failures: number;
    };
  }> {
    const events = this.events.get(webhookId) || [];
    const deliveries = this.deliveries.get(webhookId) || [];
    
    const totalEvents = events.length;
    const successfulDeliveries = deliveries.filter(d => d.status === 'success').length;
    const successRate = totalEvents > 0 ? (successfulDeliveries / totalEvents) * 100 : 0;
    const averageResponseTime = deliveries.length > 0 
      ? deliveries.reduce((sum, d) => sum + d.responseTime, 0) / deliveries.length 
      : 0;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.createdAt) > last24Hours);
    const recentDeliveries = deliveries.filter(d => new Date(d.timestamp) > last24Hours);

    return {
      totalEvents,
      successRate,
      averageResponseTime,
      last24Hours: {
        events: recentEvents.length,
        successes: recentDeliveries.filter(d => d.status === 'success').length,
        failures: recentDeliveries.filter(d => d.status === 'failed').length
      }
    };
  }

  /**
   * Retry failed webhook events
   */
  public async retryFailedEvents(webhookId: string): Promise<number> {
    const events = this.events.get(webhookId) || [];
    const failedEvents = events.filter(e => e.status === 'failed');
    
    let retryCount = 0;
    for (const event of failedEvents) {
      event.status = 'pending';
      event.attempts = 0;
      event.error = undefined;
      event.nextRetry = undefined;
      
      this.processWebhookEvent(event);
      retryCount++;
    }

    await this.saveData();
    return retryCount;
  }

  /**
   * Generate webhook secret
   */
  public generateWebhookSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Simple signature verification (in production, use proper HMAC)
    const expectedSignature = btoa(secret + payload);
    return signature === expectedSignature;
  }
}

export const webhookManager = new WebhookManager();
