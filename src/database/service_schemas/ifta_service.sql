-- IFTA Service Schema
-- This service handles IFTA registration and annual renewals

CREATE TABLE IF NOT EXISTS ifta_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'IFTA Registration',
    service_description TEXT DEFAULT 'International Fuel Tax Agreement registration and quarterly reporting',
    category TEXT DEFAULT 'Compliance',
    base_price REAL DEFAULT 299.00,
    estimated_duration TEXT DEFAULT '1-2 weeks',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["USDOT number", "Fleet information", "Fuel purchase records", "Mileage records", "State registrations"]',
    deliverables TEXT DEFAULT '["IFTA license", "Quarterly reporting setup", "Fuel tax reporting guidance", "Compliance documentation"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Annual',
    renewal_price REAL DEFAULT 299.00,
    renewal_description TEXT DEFAULT 'Annual IFTA and IRP renewal required for interstate fuel tax compliance',
    renewal_requirements TEXT DEFAULT '["Updated fleet information", "Fuel tax records", "Mileage documentation", "State registration updates"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
