-- MC Number Service Schema
-- This service handles MC number registration and annual renewals

CREATE TABLE IF NOT EXISTS mc_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'MC Number Registration',
    service_description TEXT DEFAULT 'MC number registration and operating authority for for-hire carriers',
    category TEXT DEFAULT 'Registration',
    base_price REAL DEFAULT 399.00,
    estimated_duration TEXT DEFAULT '2-4 weeks',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["USDOT number", "Insurance documentation", "BOC-3 filing", "Company information", "Operating authority application"]',
    deliverables TEXT DEFAULT '["MC number", "Operating authority", "Registration certificate", "Compliance documentation"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Annual',
    renewal_price REAL DEFAULT 299.00,
    renewal_description TEXT DEFAULT 'Annual operating authority renewal required to maintain MC number and for-hire authority',
    renewal_requirements TEXT DEFAULT '["Current insurance documentation", "Updated company information", "BOC-3 updates", "Compliance certificate"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
