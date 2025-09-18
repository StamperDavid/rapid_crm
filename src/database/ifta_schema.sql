-- IFTA (International Fuel Tax Agreement) Database Schema
-- Integrated with Rapid CRM Database

-- IFTA Registrations Table
CREATE TABLE IF NOT EXISTS ifta_registrations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    ifta_account_number TEXT UNIQUE NOT NULL,
    registration_year INTEGER NOT NULL,
    registration_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    total_miles DECIMAL(10,2) DEFAULT 0,
    total_gallons DECIMAL(10,2) DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- IFTA Quarterly Filings Table
CREATE TABLE IF NOT EXISTS ifta_quarterly_filings (
    id TEXT PRIMARY KEY,
    ifta_registration_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    quarter INTEGER NOT NULL, -- 1, 2, 3, 4
    year INTEGER NOT NULL,
    filing_period_start DATE NOT NULL,
    filing_period_end DATE NOT NULL,
    filing_due_date DATE NOT NULL,
    filing_date DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, filed, late, amended
    total_miles DECIMAL(10,2) DEFAULT 0,
    total_gallons DECIMAL(10,2) DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    total_amount_due DECIMAL(10,2) DEFAULT 0,
    payment_date DATE,
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ifta_registration_id) REFERENCES ifta_registrations(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- IFTA Vehicle Records Table
CREATE TABLE IF NOT EXISTS ifta_vehicle_records (
    id TEXT PRIMARY KEY,
    ifta_registration_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    vehicle_id TEXT,
    vehicle_vin TEXT,
    vehicle_plate TEXT,
    vehicle_state TEXT,
    vehicle_type TEXT, -- truck, trailer, etc.
    total_miles DECIMAL(10,2) DEFAULT 0,
    total_gallons DECIMAL(10,2) DEFAULT 0,
    fuel_tax_rate DECIMAL(6,4) DEFAULT 0,
    tax_due DECIMAL(10,2) DEFAULT 0,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ifta_registration_id) REFERENCES ifta_registrations(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- IFTA State Mileage Records Table
CREATE TABLE IF NOT EXISTS ifta_state_mileage (
    id TEXT PRIMARY KEY,
    ifta_vehicle_record_id TEXT NOT NULL,
    state_code TEXT NOT NULL, -- Two-letter state code
    state_name TEXT NOT NULL,
    miles_traveled DECIMAL(10,2) DEFAULT 0,
    gallons_purchased DECIMAL(10,2) DEFAULT 0,
    fuel_tax_rate DECIMAL(6,4) DEFAULT 0,
    tax_due DECIMAL(10,2) DEFAULT 0,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ifta_vehicle_record_id) REFERENCES ifta_vehicle_records(id)
);

-- IFTA Fuel Receipts Table
CREATE TABLE IF NOT EXISTS ifta_fuel_receipts (
    id TEXT PRIMARY KEY,
    ifta_vehicle_record_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    fuel_type TEXT NOT NULL, -- diesel, gasoline, etc.
    gallons_purchased DECIMAL(10,2) NOT NULL,
    price_per_gallon DECIMAL(6,4) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    vendor_name TEXT,
    vendor_address TEXT,
    vendor_city TEXT,
    vendor_state TEXT,
    vendor_zip TEXT,
    receipt_number TEXT,
    receipt_image_url TEXT,
    state_code TEXT NOT NULL, -- State where fuel was purchased
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ifta_vehicle_record_id) REFERENCES ifta_vehicle_records(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- IFTA Compliance Alerts Table
CREATE TABLE IF NOT EXISTS ifta_compliance_alerts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    ifta_registration_id TEXT,
    alert_type TEXT NOT NULL, -- filing_due, late_filing, payment_due, audit_required
    severity TEXT NOT NULL, -- low, medium, high, critical
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'open', -- open, resolved, dismissed
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATE,
    resolved_by TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (ifta_registration_id) REFERENCES ifta_registrations(id)
);

-- IFTA Audit Records Table
CREATE TABLE IF NOT EXISTS ifta_audit_records (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    ifta_registration_id TEXT NOT NULL,
    audit_type TEXT NOT NULL, -- routine, random, complaint, follow_up
    audit_date DATE NOT NULL,
    auditor_name TEXT,
    auditor_agency TEXT,
    audit_period_start DATE,
    audit_period_end DATE,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    findings TEXT,
    recommendations TEXT,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    total_amount_due DECIMAL(10,2) DEFAULT 0,
    payment_due_date DATE,
    payment_date DATE,
    payment_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (ifta_registration_id) REFERENCES ifta_registrations(id)
);

-- IFTA Service Packages Table (for CRM service offerings)
CREATE TABLE IF NOT EXISTS ifta_service_packages (
    id TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    package_type TEXT NOT NULL, -- basic, standard, premium, enterprise
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    features TEXT, -- JSON array of features
    max_vehicles INTEGER DEFAULT 10,
    max_quarterly_filings INTEGER DEFAULT 4,
    includes_audit_support BOOLEAN DEFAULT FALSE,
    includes_compliance_monitoring BOOLEAN DEFAULT FALSE,
    includes_dedicated_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IFTA Client Services Table (linking companies to IFTA services)
CREATE TABLE IF NOT EXISTS ifta_client_services (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    service_package_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active', -- active, suspended, cancelled, completed
    monthly_fee DECIMAL(10,2) NOT NULL,
    setup_fee_paid DECIMAL(10,2) DEFAULT 0,
    total_vehicles INTEGER DEFAULT 0,
    account_manager TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (service_package_id) REFERENCES ifta_service_packages(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ifta_registrations_company ON ifta_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_registrations_year ON ifta_registrations(registration_year);
CREATE INDEX IF NOT EXISTS idx_ifta_registrations_status ON ifta_registrations(status);

CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_company ON ifta_quarterly_filings(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_registration ON ifta_quarterly_filings(ifta_registration_id);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_period ON ifta_quarterly_filings(quarter, year);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_status ON ifta_quarterly_filings(status);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_due_date ON ifta_quarterly_filings(filing_due_date);

CREATE INDEX IF NOT EXISTS idx_ifta_vehicles_company ON ifta_vehicle_records(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_vehicles_registration ON ifta_vehicle_records(ifta_registration_id);
CREATE INDEX IF NOT EXISTS idx_ifta_vehicles_quarter ON ifta_vehicle_records(quarter, year);

CREATE INDEX IF NOT EXISTS idx_ifta_state_mileage_vehicle ON ifta_state_mileage(ifta_vehicle_record_id);
CREATE INDEX IF NOT EXISTS idx_ifta_state_mileage_state ON ifta_state_mileage(state_code);
CREATE INDEX IF NOT EXISTS idx_ifta_state_mileage_quarter ON ifta_state_mileage(quarter, year);

CREATE INDEX IF NOT EXISTS idx_ifta_fuel_receipts_company ON ifta_fuel_receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_receipts_vehicle ON ifta_fuel_receipts(ifta_vehicle_record_id);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_receipts_quarter ON ifta_fuel_receipts(quarter, year);
CREATE INDEX IF NOT EXISTS idx_ifta_fuel_receipts_date ON ifta_fuel_receipts(receipt_date);

CREATE INDEX IF NOT EXISTS idx_ifta_alerts_company ON ifta_compliance_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_alerts_type ON ifta_compliance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_ifta_alerts_status ON ifta_compliance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_ifta_alerts_due_date ON ifta_compliance_alerts(due_date);

CREATE INDEX IF NOT EXISTS idx_ifta_audits_company ON ifta_audit_records(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_audits_registration ON ifta_audit_records(ifta_registration_id);
CREATE INDEX IF NOT EXISTS idx_ifta_audits_date ON ifta_audit_records(audit_date);
CREATE INDEX IF NOT EXISTS idx_ifta_audits_status ON ifta_audit_records(status);

CREATE INDEX IF NOT EXISTS idx_ifta_services_package_type ON ifta_service_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_ifta_services_active ON ifta_service_packages(is_active);

CREATE INDEX IF NOT EXISTS idx_ifta_client_services_company ON ifta_client_services(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_client_services_package ON ifta_client_services(service_package_id);
CREATE INDEX IF NOT EXISTS idx_ifta_client_services_status ON ifta_client_services(status);
