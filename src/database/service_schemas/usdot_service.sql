-- USDOT Registration Service Schema
-- This service handles USDOT number registration and biennial renewals

CREATE TABLE IF NOT EXISTS usdot_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'USDOT Registration',
    service_description TEXT DEFAULT 'USDOT number registration and MCS-150 filing for interstate carriers',
    category TEXT DEFAULT 'Registration',
    base_price REAL DEFAULT 299.00,
    estimated_duration TEXT DEFAULT '1-2 business days',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["Company information", "Business address", "EIN number", "Fleet information", "Insurance documentation"]',
    deliverables TEXT DEFAULT '["USDOT number", "MCS-150 filing", "Registration certificate", "Compliance documentation"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Biennial',
    renewal_price REAL DEFAULT 199.00,
    renewal_description TEXT DEFAULT 'Biennial MCS-150 update required every 2 years to maintain USDOT number',
    renewal_requirements TEXT DEFAULT '["Updated company information", "Current fleet data", "Insurance updates", "Compliance documentation"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
