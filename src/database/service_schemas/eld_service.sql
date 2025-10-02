-- ELD Service Schema
-- This service handles ELD compliance and annual renewals

CREATE TABLE IF NOT EXISTS eld_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'ELD Compliance',
    service_description TEXT DEFAULT 'Electronic Logging Device compliance and monitoring services',
    category TEXT DEFAULT 'Compliance',
    base_price REAL DEFAULT 249.00,
    estimated_duration TEXT DEFAULT '1-2 weeks',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["Fleet information", "Driver information", "Current ELD system", "Compliance history"]',
    deliverables TEXT DEFAULT '["ELD compliance setup", "Driver training", "Monitoring system", "Compliance documentation"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Annual',
    renewal_price REAL DEFAULT 199.00,
    renewal_description TEXT DEFAULT 'Annual ELD compliance review and system updates',
    renewal_requirements TEXT DEFAULT '["Updated fleet information", "Driver compliance records", "ELD system updates", "Training records"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
