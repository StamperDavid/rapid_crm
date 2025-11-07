/**
 * PayPal Payment Provider Implementation
 * CommonJS version for compatibility with server.js
 */

class PayPalProvider {
  constructor(clientId, clientSecret, environment = 'sandbox') {
    this.name = 'PayPal';
    this.version = 'v2';
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal Client ID and Secret are required');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBase = environment === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID;
  }

  /**
   * Get PayPal access token
   */
  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create PayPal order (checkout session)
   */
  async createCheckoutSession(params) {
    try {
      const accessToken = await this.getAccessToken();

      const order = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.dealId,
            description: params.description,
            custom_id: params.dealId,
            amount: {
              currency_code: params.currency.toUpperCase(),
              value: params.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Rapid CRM',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: params.successUrl,
          cancel_url: params.cancelUrl,
        },
      };

      const response = await fetch(`${this.apiBase}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create PayPal order');
      }

      const data = await response.json();
      const approveLink = data.links.find(link => link.rel === 'approve');
      
      return {
        sessionId: data.id,
        checkoutUrl: approveLink?.href || '',
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        amount: params.amount,
        currency: params.currency,
      };
    } catch (error) {
      throw new Error(`Failed to create PayPal checkout: ${error.message}`);
    }
  }

  /**
   * Process payment (capture order)
   */
  async processPayment(params) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.apiBase}/v2/checkout/orders/${params.paymentMethodId}/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment capture failed');
      }

      const data = await response.json();
      const capture = data.purchase_units[0].payments.captures[0];

      return {
        success: capture.status === 'COMPLETED',
        paymentId: capture.id,
        amount: parseFloat(capture.amount.value),
        currency: capture.amount.currency_code,
        status: this.mapPayPalStatus(capture.status),
        metadata: params.metadata,
      };
    } catch (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Handle PayPal webhook
   */
  async handleWebhook(request) {
    try {
      const event = request.body;

      switch (event.event_type) {
        case 'CHECKOUT.ORDER.APPROVED':
        case 'PAYMENT.CAPTURE.COMPLETED': {
          const resource = event.resource;
          return {
            eventType: 'payment.completed',
            paymentId: resource.id,
            amount: parseFloat(resource.amount?.value || '0'),
            currency: resource.amount?.currency_code || 'USD',
            metadata: resource.custom_id ? { dealId: resource.custom_id } : {},
          };
        }

        case 'PAYMENT.CAPTURE.REFUNDED': {
          const resource = event.resource;
          return {
            eventType: 'payment.refunded',
            paymentId: resource.id,
            amount: parseFloat(resource.amount?.value || '0'),
            currency: resource.amount?.currency_code || 'USD',
          };
        }

        case 'PAYMENT.CAPTURE.DENIED':
        case 'CHECKOUT.ORDER.VOIDED': {
          const resource = event.resource;
          return {
            eventType: 'payment.failed',
            paymentId: resource.id,
          };
        }

        default:
          return {
            eventType: event.event_type,
          };
      }
    } catch (error) {
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiBase}/v2/payments/captures/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const data = await response.json();

      return {
        paymentId: data.id,
        status: this.mapPayPalStatus(data.status),
        amount: parseFloat(data.amount.value),
        currency: data.amount.currency_code,
        createdAt: new Date(data.create_time),
        updatedAt: new Date(data.update_time),
      };
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(params) {
    try {
      const accessToken = await this.getAccessToken();

      const refundRequest = {};
      if (params.amount) {
        refundRequest.amount = {
          value: params.amount.toFixed(2),
          currency_code: 'USD',
        };
      }

      const response = await fetch(
        `${this.apiBase}/v2/payments/captures/${params.paymentId}/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(refundRequest),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          refundId: '',
          amount: params.amount || 0,
          status: 'failed',
          error: error.message || 'Refund failed',
        };
      }

      const data = await response.json();

      return {
        success: data.status === 'COMPLETED',
        refundId: data.id,
        amount: parseFloat(data.amount.value),
        status: data.status === 'COMPLETED' ? 'succeeded' : 'pending',
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
   * Create customer (PayPal doesn't have a customer object)
   */
  async createCustomer(params) {
    return {
      customerId: `paypal_${Date.now()}`,
      email: params.email,
      name: params.name,
      createdAt: new Date(),
    };
  }

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId) {
    return [];
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId) {
    return false;
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(request) {
    // PayPal webhook verification (simplified for now)
    return true;
  }

  /**
   * Get configuration requirements
   */
  getConfigRequirements() {
    return [
      {
        key: 'PAYPAL_CLIENT_ID',
        name: 'Client ID',
        description: 'PayPal REST API Client ID',
        required: true,
        type: 'string',
        sensitive: false,
      },
      {
        key: 'PAYPAL_CLIENT_SECRET',
        name: 'Client Secret',
        description: 'PayPal REST API Client Secret',
        required: true,
        type: 'string',
        sensitive: true,
      },
      {
        key: 'PAYPAL_ENVIRONMENT',
        name: 'Environment',
        description: 'PayPal environment (sandbox or production)',
        required: true,
        type: 'string',
        sensitive: false,
        example: 'sandbox',
      },
    ];
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Map PayPal status to standard status
   */
  mapPayPalStatus(paypalStatus) {
    switch (paypalStatus) {
      case 'COMPLETED':
        return 'succeeded';
      case 'PENDING':
      case 'CREATED':
      case 'APPROVED':
        return 'pending';
      case 'VOIDED':
      case 'EXPIRED':
        return 'canceled';
      case 'DECLINED':
      case 'FAILED':
        return 'failed';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'refunded';
      default:
        return 'pending';
    }
  }
}

module.exports = PayPalProvider;






