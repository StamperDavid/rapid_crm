interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  setupFee: number;
  stripePriceId: string;
  stripeSetupPriceId: string;
  maxTrucks: number;
  features: string[];
}

interface Customer {
  id: string;
  email: string;
  name: string;
  companyId: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

class StripeService {
  private config: StripeConfig | null = null;
  private isInitialized = false;
  private API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api';

  constructor() {
    // Configuration will be loaded from database during initialization
  }

  /**
   * Load Stripe API keys from database
   */
  private async loadApiKeys(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/api-keys`);
      if (!response.ok) {
        throw new Error(`Failed to load API keys: ${response.status}`);
      }
      
      const apiKeys = await response.json();
      
      // Find Stripe API keys
      const publishableKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('stripe') && 
        key.name.toLowerCase().includes('publishable')
      );
      const secretKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('stripe') && 
        key.name.toLowerCase().includes('secret')
      );
      const webhookSecret = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('stripe') && 
        key.name.toLowerCase().includes('webhook')
      );

      this.config = {
        publishableKey: publishableKey?.key || 'pk_test_demo_key',
        secretKey: secretKey?.key || 'sk_test_demo_key',
        webhookSecret: webhookSecret?.key || 'whsec_demo_secret'
      };

      console.log('Stripe API keys loaded from database');
    } catch (error) {
      console.error('Failed to load Stripe API keys from database:', error);
      // Fallback to demo keys if database loading fails
      this.config = {
        publishableKey: 'pk_test_demo_key',
        secretKey: 'sk_test_demo_key',
        webhookSecret: 'whsec_demo_secret'
      };
    }
  }

  /**
   * Initialize Stripe service
   */
  async initialize(): Promise<boolean> {
    try {
      // Load API keys from database first
      await this.loadApiKeys();
      
      // In a real implementation, this would load Stripe.js
      // For MVP, we'll simulate the initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(customerData: {
    email: string;
    name: string;
    companyId: string;
    address?: any;
  }): Promise<Customer> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      // Simulate Stripe customer creation
      const customer: Customer = {
        id: `cus_${Date.now()}`,
        email: customerData.email,
        name: customerData.name,
        companyId: customerData.companyId,
        stripeCustomerId: `cus_stripe_${Date.now()}`,
        status: 'active'
      };

      // In real implementation, this would be an API call to your backend
      console.log('Creating Stripe customer:', customer);
      
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(customerId: string, planId: string): Promise<{
    subscriptionId: string;
    clientSecret: string;
    status: string;
  }> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      const subscriptionId = `sub_${Date.now()}`;
      const clientSecret = `pi_${Date.now()}_secret`;

      // Simulate subscription creation
      const subscription = {
        subscriptionId,
        clientSecret,
        status: 'active'
      };

      console.log('Creating subscription:', subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Create a payment intent for setup fees
   */
  async createPaymentIntent(amount: number, customerId: string): Promise<PaymentIntent> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        status: 'requires_payment_method',
        clientSecret: `pi_${Date.now()}_secret`
      };

      console.log('Creating payment intent:', paymentIntent);
      
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: string;
    currentPeriodEnd: string;
    plan: SubscriptionPlan;
  }> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      // Simulate subscription retrieval
      const subscription = {
        id: subscriptionId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: {
          id: 'standard',
          name: 'Standard ELD Plus',
          description: 'Advanced compliance with audit support',
          monthlyPrice: 100,
          setupFee: 1000,
          stripePriceId: 'price_standard',
          stripeSetupPriceId: 'price_setup_standard',
          maxTrucks: 50,
          features: ['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews']
        }
      };

      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{
    id: string;
    status: string;
    canceledAt: string;
  }> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      const cancellation = {
        id: subscriptionId,
        status: 'canceled',
        canceledAt: new Date().toISOString()
      };

      console.log('Canceling subscription:', cancellation);
      
      return cancellation;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Get payment methods for a customer
   */
  async getPaymentMethods(customerId: string): Promise<any[]> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Stripe service not initialized');
    }

    try {
      // Simulate payment methods retrieval
      const paymentMethods = [
        {
          id: 'pm_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025
          }
        }
      ];

      return paymentMethods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error(`Failed to get payment methods: ${error.message}`);
    }
  }

  /**
   * Process webhook events
   */
  async processWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      // In real implementation, this would verify the webhook signature
      // and process different event types
      console.log('Processing webhook:', { payload, signature });
      
      return true;
    } catch (error) {
      console.error('Error processing webhook:', error);
      return false;
    }
  }

  /**
   * Get available subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic ELD Compliance',
        description: 'Essential ELD tracking and basic compliance monitoring',
        monthlyPrice: 50,
        setupFee: 500,
        stripePriceId: 'price_basic',
        stripeSetupPriceId: 'price_setup_basic',
        maxTrucks: 10,
        features: ['HOS Logging', 'Basic DVIR', 'Compliance Alerts', 'Monthly Reports']
      },
      {
        id: 'standard',
        name: 'Standard ELD Plus',
        description: 'Advanced compliance with audit support',
        monthlyPrice: 100,
        setupFee: 1000,
        stripePriceId: 'price_standard',
        stripeSetupPriceId: 'price_setup_standard',
        maxTrucks: 50,
        features: ['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews']
      },
      {
        id: 'premium',
        name: 'Premium ELD Enterprise',
        description: 'Full compliance suite with dedicated support',
        monthlyPrice: 200,
        setupFee: 2000,
        stripePriceId: 'price_premium',
        stripeSetupPriceId: 'price_setup_premium',
        maxTrucks: 200,
        features: ['All Standard Features', 'Dedicated Account Manager', '24/7 Support', 'Custom Reporting']
      }
    ];
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export default StripeService;



