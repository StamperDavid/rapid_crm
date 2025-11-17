/**
 * Payment Service Manager
 * Manages multiple payment providers and handles provider switching
 * CommonJS version for compatibility
 */

const StripeProvider = require('./providers/StripeProvider');
const PayPalProvider = require('./providers/PayPalProvider');

class PaymentService {
  constructor(db) {
    this.providers = new Map();
    this.activeProviderName = 'stripe';
    this.db = db;
    
    this.registerProviders();
    this.loadActiveProvider();
  }

  /**
   * Register all available payment providers
   */
  registerProviders() {
    // Register Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new StripeProvider(
          process.env.STRIPE_SECRET_KEY,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        this.providers.set('stripe', stripe);
        console.log('✅ Stripe provider registered');
      } catch (error) {
        console.error('❌ Failed to register Stripe provider:', error);
      }
    } else {
      console.log('⚠️  Stripe not configured (missing STRIPE_SECRET_KEY)');
    }

    // Register PayPal
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      try {
        const paypal = new PayPalProvider(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
          process.env.PAYPAL_ENVIRONMENT || 'sandbox'
        );
        this.providers.set('paypal', paypal);
        console.log('✅ PayPal provider registered');
      } catch (error) {
        console.error('❌ Failed to register PayPal provider:', error);
      }
    } else {
      console.log('⚠️  PayPal not configured (missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET)');
    }

    console.log(`💳 ${this.providers.size} payment provider(s) available:`, Array.from(this.providers.keys()).join(', '));
  }

  /**
   * Load active provider from database or environment
   */
  loadActiveProvider() {
    const envProvider = process.env.ACTIVE_PAYMENT_PROVIDER;
    if (envProvider && this.providers.has(envProvider)) {
      this.activeProviderName = envProvider;
      console.log(`💳 Active payment provider set from env: ${envProvider}`);
      return;
    }

    if (this.db) {
      this.db.get(
        `SELECT value FROM system_settings WHERE key = 'active_payment_provider'`,
        (err, row) => {
          if (!err && row && this.providers.has(row.value)) {
            this.activeProviderName = row.value;
            console.log(`💳 Active payment provider loaded from DB: ${row.value}`);
          } else {
            const firstProvider = Array.from(this.providers.keys())[0];
            if (firstProvider) {
              this.activeProviderName = firstProvider;
              console.log(`💳 Active payment provider defaulted to: ${firstProvider}`);
            }
          }
        }
      );
    } else {
      const firstProvider = Array.from(this.providers.keys())[0];
      if (firstProvider) {
        this.activeProviderName = firstProvider;
        console.log(`💳 Active payment provider (no DB): ${firstProvider}`);
      }
    }
  }

  /**
   * Get the currently active payment provider
   */
  getActiveProvider() {
    const provider = this.providers.get(this.activeProviderName);
    
    if (!provider) {
      throw new Error(
        `Payment provider '${this.activeProviderName}' is not configured. ` +
        `Available providers: ${Array.from(this.providers.keys()).join(', ')}`
      );
    }
    
    return provider;
  }

  /**
   * Get provider by name
   */
  getProvider(name) {
    return this.providers.get(name.toLowerCase());
  }

  /**
   * Switch active payment provider
   */
  async setActiveProvider(providerName) {
    const lowerName = providerName.toLowerCase();
    
    if (!this.providers.has(lowerName)) {
      throw new Error(
        `Payment provider '${providerName}' is not available. ` +
        `Available providers: ${Array.from(this.providers.keys()).join(', ')}`
      );
    }

    if (this.db) {
      await this.saveProviderPreference(lowerName);
    }

    this.activeProviderName = lowerName;
    console.log(`💳 Switched active payment provider to: ${providerName}`);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders() {
    const allProviders = ['stripe', 'paypal', 'square'];
    
    return allProviders.map(name => ({
      name,
      configured: this.providers.has(name),
      active: name === this.activeProviderName,
    }));
  }

  /**
   * Save provider preference to database
   */
  async saveProviderPreference(providerName) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
         VALUES ('active_payment_provider', ?, datetime('now'))`,
        [providerName],
        (err) => {
          if (err) {
            console.error('Failed to save payment provider preference:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Wrapper methods
  async createCheckoutSession(params) {
    return this.getActiveProvider().createCheckoutSession(params);
  }

  async processPayment(params) {
    return this.getActiveProvider().processPayment(params);
  }

  async getPaymentStatus(paymentId) {
    return this.getActiveProvider().getPaymentStatus(paymentId);
  }

  async refundPayment(params) {
    return this.getActiveProvider().refundPayment(params);
  }

  async createCustomer(params) {
    return this.getActiveProvider().createCustomer(params);
  }

  async getCustomerPaymentMethods(customerId) {
    return this.getActiveProvider().getCustomerPaymentMethods(customerId);
  }

  async deletePaymentMethod(paymentMethodId) {
    return this.getActiveProvider().deletePaymentMethod(paymentMethodId);
  }

  async handleWebhook(providerName, request) {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      throw new Error(`Unknown payment provider: ${providerName}`);
    }
    
    return provider.handleWebhook(request);
  }

  async verifyWebhookSignature(providerName, request) {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      throw new Error(`Unknown payment provider: ${providerName}`);
    }
    
    return provider.verifyWebhookSignature(request);
  }

  async testProviderConnection(providerName) {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      return false;
    }
    
    return provider.testConnection();
  }

  getProviderConfigRequirements(providerName) {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      throw new Error(`Unknown payment provider: ${providerName}`);
    }
    
    return provider.getConfigRequirements();
  }

  getProviderInfo(providerName) {
    const provider = this.providers.get(providerName.toLowerCase());
    
    if (!provider) {
      return null;
    }
    
    return {
      name: provider.name,
      version: provider.version,
      configured: true,
      active: providerName.toLowerCase() === this.activeProviderName,
    };
  }
}

// Singleton
let paymentServiceInstance = null;

function initializePaymentService(db) {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService(db);
  }
  return paymentServiceInstance;
}

function getPaymentService() {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService();
  }
  return paymentServiceInstance;
}

module.exports = {
  PaymentService,
  initializePaymentService,
  getPaymentService
};









