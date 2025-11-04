/**
 * Stripe Payment Provider Implementation
 * CommonJS version for compatibility with server.js
 */

const Stripe = require('stripe');

class StripeProvider {
  constructor(apiKey, webhookSecret) {
    this.name = 'Stripe';
    this.version = '2024-11-20.acacia';
    
    if (!apiKey) {
      throw new Error('Stripe API key is required');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-11-20.acacia',
    });

    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  /**
   * Create Stripe Checkout Session
   */
  async createCheckoutSession(params) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.description,
                description: `Services: ${params.services.join(', ')}`,
              },
              unit_amount: Math.round(params.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        client_reference_id: params.dealId,
        metadata: {
          dealId: params.dealId,
          companyId: params.companyId || '',
          services: params.services.join(','),
          ...params.metadata,
        },
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url || '',
        expiresAt: new Date(session.expires_at * 1000),
        amount: params.amount,
        currency: params.currency,
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
    }
  }

  /**
   * Process direct payment with saved payment method
   */
  async processPayment(params) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency.toLowerCase(),
        payment_method: params.paymentMethodId,
        customer: params.customerId,
        description: params.description,
        metadata: params.metadata || {},
        confirm: true,
        return_url: process.env.BASE_URL + '/payment/return',
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: this.mapStripeStatus(paymentIntent.status),
        customerId: paymentIntent.customer,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(request) {
    try {
      const sig = request.headers['stripe-signature'];
      
      if (!sig || typeof sig !== 'string') {
        throw new Error('Missing signature');
      }

      const event = this.stripe.webhooks.constructEvent(
        request.rawBody || request.body,
        sig,
        this.webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          return {
            eventType: 'payment.completed',
            sessionId: session.id,
            paymentId: session.payment_intent,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || 'USD',
            customerEmail: session.customer_email || undefined,
            metadata: session.metadata || {},
          };
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          return {
            eventType: 'payment.succeeded',
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            metadata: paymentIntent.metadata,
          };
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          return {
            eventType: 'payment.failed',
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            metadata: paymentIntent.metadata,
          };
        }

        case 'charge.refunded': {
          const charge = event.data.object;
          return {
            eventType: 'payment.refunded',
            paymentId: charge.payment_intent,
            amount: charge.amount_refunded / 100,
            currency: charge.currency.toUpperCase(),
          };
        }

        default:
          return {
            eventType: event.type,
          };
      }
    } catch (error) {
      if (error.type === 'StripeSignatureVerificationError') {
        throw new Error('Invalid webhook signature');
      }
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      return {
        paymentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        createdAt: new Date(paymentIntent.created * 1000),
        updatedAt: new Date(),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(params) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentId,
        amount: params.amount ? Math.round(params.amount * 100) : undefined,
        reason: params.reason,
      });

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status === 'succeeded' ? 'succeeded' : 
                refund.status === 'pending' ? 'pending' : 'failed',
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount: params.amount || 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Create customer
   */
  async createCustomer(params) {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata || {},
      });

      return {
        customerId: customer.id,
        email: customer.email || params.email,
        name: customer.name || params.name,
        createdAt: new Date(customer.created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
        isDefault: false,
      }));
    } catch (error) {
      throw new Error(`Failed to get payment methods: ${error.message}`);
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId) {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      return true;
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(request) {
    try {
      const sig = request.headers['stripe-signature'];
      
      if (!sig || typeof sig !== 'string') {
        return false;
      }

      this.stripe.webhooks.constructEvent(
        request.rawBody || request.body,
        sig,
        this.webhookSecret
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get configuration requirements
   */
  getConfigRequirements() {
    return [
      {
        key: 'STRIPE_SECRET_KEY',
        name: 'Secret Key',
        description: 'Stripe secret API key (starts with sk_)',
        required: true,
        type: 'string',
        sensitive: true,
        example: 'sk_test_...',
      },
      {
        key: 'STRIPE_PUBLISHABLE_KEY',
        name: 'Publishable Key',
        description: 'Stripe publishable API key (starts with pk_)',
        required: true,
        type: 'string',
        sensitive: false,
        example: 'pk_test_...',
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        name: 'Webhook Secret',
        description: 'Stripe webhook signing secret (starts with whsec_)',
        required: true,
        type: 'string',
        sensitive: true,
        example: 'whsec_...',
      },
    ];
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.stripe.balance.retrieve();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Map Stripe status to our standard status
   */
  mapStripeStatus(stripeStatus) {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded';
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      case 'canceled':
        return 'canceled';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

module.exports = StripeProvider;



