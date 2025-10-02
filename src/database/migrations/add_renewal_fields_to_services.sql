-- Migration: Add Renewal Management Fields to Services Table
-- This migration adds renewal management fields to the existing services table
-- without breaking existing data

-- Add renewal management columns to services table
ALTER TABLE services ADD COLUMN has_renewal INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN renewal_frequency TEXT;
ALTER TABLE services ADD COLUMN renewal_price REAL DEFAULT 0;
ALTER TABLE services ADD COLUMN renewal_description TEXT;
ALTER TABLE services ADD COLUMN renewal_requirements TEXT;
ALTER TABLE services ADD COLUMN renewal_deadline TEXT;
ALTER TABLE services ADD COLUMN auto_renewal INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN renewal_reminders TEXT;

-- Create deal_services table for multiple services per deal
CREATE TABLE IF NOT EXISTS deal_services (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    custom_price REAL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    next_renewal_date TEXT,
    renewal_status TEXT DEFAULT 'active',
    auto_renewal INTEGER DEFAULT 0,
    last_renewal_date TEXT,
    renewal_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Add total_value column to deals table for multiple services support
ALTER TABLE deals ADD COLUMN total_value REAL;

-- Update existing deals to set total_value equal to value (for backward compatibility)
UPDATE deals SET total_value = value WHERE total_value IS NULL;
