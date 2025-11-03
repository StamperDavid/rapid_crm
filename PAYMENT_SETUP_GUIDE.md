# 💳 Payment Provider Setup Guide

## Environment Variables Required

Create a `.env` file in the project root with these variables:

### Required for All Providers
```bash
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:5173
ACTIVE_PAYMENT_PROVIDER=stripe  # or 'paypal' or 'square'
```

### Stripe Configuration
Get from: https://dashboard.stripe.com/apikeys
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### PayPal Configuration
Get from: https://developer.paypal.com/dashboard/
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_ENVIRONMENT=sandbox  # or 'production'
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
```

### Square Configuration (Optional)
Get from: https://developer.squareup.com/
```bash
SQUARE_ACCESS_TOKEN=your_square_access_token_here
SQUARE_LOCATION_ID=your_square_location_id_here
SQUARE_ENVIRONMENT=sandbox  # or 'production'
```

---

## Quick Start

```powershell
cd C:\Users\David\PycharmProjects\Rapid_CRM

# 1. Add payment tables to database
npm run add-payment-tables

# 2. Configure your .env file with payment provider credentials

# 3. Restart server
npm run dev:full

# 4. Test payment providers at: GET /api/payments/providers
```

---

## Switching Payment Providers

You can switch providers anytime via:

### Option 1: Environment Variable
```bash
# In .env file:
ACTIVE_PAYMENT_PROVIDER=paypal  # Changes from stripe to paypal
```

### Option 2: Admin UI
Navigate to Payment Settings in admin panel and click "Activate" on desired provider.

### Option 3: API Call
```bash
POST /api/payments/providers/active
{
  "provider": "paypal"
}
```

---

## Testing Connections

Test if a provider is configured correctly:
```bash
POST /api/payments/providers/stripe/test
# Returns: { success: true/false, provider: "stripe", message: "..." }
```

