-- Hazmat Service Schema
-- This service handles hazmat permits and annual renewals

CREATE TABLE IF NOT EXISTS hazmat_services (
    id TEXT PRIMARY KEY,
    service_name TEXT DEFAULT 'Hazmat Permit',
    service_description TEXT DEFAULT 'Hazardous materials permit and compliance services',
    category TEXT DEFAULT 'Compliance',
    base_price REAL DEFAULT 399.00,
    estimated_duration TEXT DEFAULT '2-4 weeks',
    
    -- Service Requirements
    requirements TEXT DEFAULT '["Hazmat classification", "Driver certifications", "Vehicle specifications", "Insurance documentation", "Training records"]',
    deliverables TEXT DEFAULT '["Hazmat permit", "Compliance documentation", "Training materials", "Usage guidelines"]',
    is_active INTEGER DEFAULT 1,
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 1,
    renewal_frequency TEXT DEFAULT 'Annual',
    renewal_price REAL DEFAULT 249.00,
    renewal_description TEXT DEFAULT 'Annual hazmat permit renewal and compliance review',
    renewal_requirements TEXT DEFAULT '["Updated hazmat classification", "Current driver certifications", "Vehicle compliance records", "Training requirements"]',
    renewal_deadline TEXT DEFAULT '30 days before expiration',
    auto_renewal INTEGER DEFAULT 1,
    renewal_reminders TEXT DEFAULT '["90 days", "60 days", "30 days", "7 days"]',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
