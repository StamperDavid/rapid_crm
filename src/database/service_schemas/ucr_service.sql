-- UCR Registration Service Schema
-- This service handles UCR registration and annual renewals

CREATE TABLE IF NOT EXISTS ucr_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'UCR Registration',
    service_description TEXT DEFAULT 'Unified Carrier Registration for interstate carriers and brokers',
    category TEXT DEFAULT 'Registration',
    base_price REAL DEFAULT 199.00,
    estimated_duration TEXT DEFAULT '1-2 business days',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["USDOT number", "Company information", "State operations list", "Fleet information"]',
    deliverables TEXT DEFAULT '["UCR registration", "State coverage documentation", "Registration certificate", "Compliance documentation"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Annual',
    renewal_price REAL DEFAULT 149.00,
    renewal_description TEXT DEFAULT 'Annual UCR registration required for interstate carriers and brokers',
    renewal_requirements TEXT DEFAULT '["Current USDOT number", "Updated company information", "State operations updates", "Fleet information"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
