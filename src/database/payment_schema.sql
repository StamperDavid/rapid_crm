-- Payment System Database Schema
-- Stores payment transactions and provider configurations

-- System Settings Table (if not exists)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Payment Providers Configuration
CREATE TABLE IF NOT EXISTS payment_providers (
    id TEXT PRIMARY KEY,
    provider_name TEXT NOT NULL UNIQUE, -- 'stripe', 'paypal', 'square'
    is_active INTEGER DEFAULT 0, -- 0 = inactive, 1 = active
    credentials_encrypted TEXT, -- Encrypted JSON: { apiKey, secret, etc. }
    configuration TEXT, -- JSON: { webhookUrl, environment, etc. }
    is_configured INTEGER DEFAULT 0, -- 0 = not configured, 1 = configured
    last_test_at TEXT, -- Last successful connection test
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Payment Transactions (provider-agnostic)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL, -- Which provider processed it ('stripe', 'paypal', etc.)
    provider_payment_id TEXT, -- Provider's reference ID (Stripe payment_intent, PayPal order ID)
    provider_session_id TEXT, -- Provider's session/checkout ID
    
    -- Business References
    deal_id TEXT, -- Reference to deals table
    company_id TEXT, -- Reference to companies table
    invoice_id TEXT, -- Reference to invoices table (optional)
    
    -- Payment Details
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    
    -- Status
    status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled', 'refunded'
    payment_method TEXT, -- 'card', 'paypal', etc.
    
    -- Customer Information
    customer_email TEXT,
    customer_name TEXT,
    provider_customer_id TEXT, -- Stripe customer ID, PayPal payer ID, etc.
    
    -- Timestamps
    paid_at TEXT, -- When payment was completed
    refunded_at TEXT, -- When payment was refunded
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    -- Metadata
    metadata TEXT, -- JSON: any additional data
    
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    provider_refund_id TEXT, -- Provider's refund ID
    
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    reason TEXT,
    status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed'
    
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);

-- Payment Webhooks Log (for debugging/auditing)
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_id TEXT, -- Provider's event ID
    
    verified INTEGER DEFAULT 0, -- 0 = not verified, 1 = verified signature
    processed INTEGER DEFAULT 0, -- 0 = not processed, 1 = processed
    
    payload TEXT, -- JSON: full webhook payload
    error_message TEXT, -- If processing failed
    
    received_at TEXT NOT NULL,
    processed_at TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_deal ON payment_transactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_company ON payment_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_payment ON payment_transactions(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction ON payment_refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);

-- Insert default active provider (Stripe) if not exists
INSERT OR IGNORE INTO system_settings (key, value, updated_at) 
VALUES ('active_payment_provider', 'stripe', datetime('now'));



