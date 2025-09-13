-- USDOT Application Record Schema
-- This schema contains all required fields for USDOT applications
-- Maps directly to onboarding agent questions

CREATE TABLE IF NOT EXISTS usdot_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Company Information
    company_name TEXT NOT NULL,
    dba_name TEXT, -- Doing Business As
    legal_name TEXT,
    company_type TEXT CHECK(company_type IN ('corporation', 'llc', 'partnership', 'sole_proprietorship', 'other')),
    
    -- Contact Information
    primary_contact_name TEXT NOT NULL,
    primary_contact_title TEXT,
    primary_contact_phone TEXT NOT NULL,
    primary_contact_email TEXT NOT NULL,
    primary_contact_fax TEXT,
    
    -- Mailing Address
    mailing_address_line1 TEXT NOT NULL,
    mailing_address_line2 TEXT,
    mailing_city TEXT NOT NULL,
    mailing_state TEXT NOT NULL,
    mailing_zip TEXT NOT NULL,
    mailing_country TEXT DEFAULT 'USA',
    
    -- Physical Address (if different from mailing)
    physical_address_same_as_mailing BOOLEAN DEFAULT TRUE,
    physical_address_line1 TEXT,
    physical_address_line2 TEXT,
    physical_city TEXT,
    physical_state TEXT,
    physical_zip TEXT,
    physical_country TEXT DEFAULT 'USA',
    
    -- Operation Details
    operation_type TEXT NOT NULL CHECK(operation_type IN ('for_hire', 'private', 'both')),
    operation_radius TEXT NOT NULL CHECK(operation_radius IN ('intrastate', 'interstate', 'both')),
    operation_description TEXT,
    
    -- Cargo Information
    cargo_types TEXT, -- JSON array of cargo types
    hazmat_cargo BOOLEAN DEFAULT FALSE,
    hazmat_details TEXT, -- Specific hazmat materials
    passenger_transport BOOLEAN DEFAULT FALSE,
    passenger_count INTEGER DEFAULT 0,
    
    -- Vehicle Information
    total_vehicles INTEGER NOT NULL DEFAULT 0,
    vehicle_details TEXT, -- JSON array of vehicle objects
    total_power_units INTEGER DEFAULT 0,
    total_trailers INTEGER DEFAULT 0,
    
    -- Authority Requirements
    requires_mc_authority BOOLEAN DEFAULT FALSE,
    requires_ff_authority BOOLEAN DEFAULT FALSE,
    requires_broker_authority BOOLEAN DEFAULT FALSE,
    requires_hazmat_authority BOOLEAN DEFAULT FALSE,
    
    -- Financial Information
    estimated_annual_revenue DECIMAL(15,2),
    estimated_annual_miles INTEGER,
    insurance_company TEXT,
    insurance_policy_number TEXT,
    insurance_amount DECIMAL(15,2),
    
    -- Compliance Information
    safety_rating TEXT,
    safety_certificate_number TEXT,
    safety_certificate_date DATE,
    drug_alcohol_program BOOLEAN DEFAULT FALSE,
    drug_alcohol_program_details TEXT,
    
    -- Application Status
    application_status TEXT DEFAULT 'draft' CHECK(application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_correction')),
    submission_date DATE,
    approval_date DATE,
    usdot_number TEXT UNIQUE,
    mc_number TEXT UNIQUE,
    ff_number TEXT UNIQUE,
    
    -- Payment Information
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_reference TEXT,
    payment_date DATE,
    
    -- Portal Account
    portal_account_created BOOLEAN DEFAULT FALSE,
    portal_username TEXT,
    portal_password_hash TEXT,
    customer_service_handoff_completed BOOLEAN DEFAULT FALSE,
    handoff_notes TEXT,
    
    -- Audit Fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    
    -- Additional Notes
    notes TEXT,
    special_instructions TEXT
);

-- Vehicle Details Table (for normalized vehicle data)
CREATE TABLE IF NOT EXISTS usdot_vehicle_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usdot_application_id INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('truck', 'tractor', 'trailer', 'bus', 'van', 'other')),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    vin TEXT,
    gvwr INTEGER, -- Gross Vehicle Weight Rating
    gvw INTEGER, -- Gross Vehicle Weight
    license_plate TEXT,
    license_state TEXT,
    is_owned BOOLEAN DEFAULT TRUE,
    is_leased BOOLEAN DEFAULT FALSE,
    lease_company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usdot_application_id) REFERENCES usdot_applications(id) ON DELETE CASCADE
);

-- Cargo Types Table (for normalized cargo data)
CREATE TABLE IF NOT EXISTS usdot_cargo_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usdot_application_id INTEGER NOT NULL,
    cargo_type TEXT NOT NULL CHECK(cargo_type IN (
        'general_freight', 'hazardous_materials', 'passengers', 'household_goods', 
        'refrigerated', 'livestock', 'grain', 'construction_materials', 'other'
    )),
    description TEXT,
    percentage_of_operation INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usdot_application_id) REFERENCES usdot_applications(id) ON DELETE CASCADE
);

-- Application History Table (for tracking changes)
CREATE TABLE IF NOT EXISTS usdot_application_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usdot_application_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (usdot_application_id) REFERENCES usdot_applications(id) ON DELETE CASCADE
);

-- Compliance Requirements Table
CREATE TABLE IF NOT EXISTS usdot_compliance_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usdot_application_id INTEGER NOT NULL,
    requirement_type TEXT NOT NULL CHECK(requirement_type IN (
        'usdot_number', 'mc_authority', 'ff_authority', 'broker_authority', 
        'hazmat_authority', 'compliance_monitoring', 'safety_certificate', 
        'drug_alcohol_program', 'insurance', 'other'
    )),
    requirement_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    cost DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usdot_application_id) REFERENCES usdot_applications(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usdot_applications_company_name ON usdot_applications(company_name);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_operation_type ON usdot_applications(operation_type);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_operation_radius ON usdot_applications(operation_radius);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_status ON usdot_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_usdot_number ON usdot_applications(usdot_number);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_mc_number ON usdot_applications(mc_number);
CREATE INDEX IF NOT EXISTS idx_usdot_vehicle_details_application_id ON usdot_vehicle_details(usdot_application_id);
CREATE INDEX IF NOT EXISTS idx_usdot_cargo_types_application_id ON usdot_cargo_types(usdot_application_id);
CREATE INDEX IF NOT EXISTS idx_usdot_application_history_application_id ON usdot_application_history(usdot_application_id);
CREATE INDEX IF NOT EXISTS idx_usdot_compliance_requirements_application_id ON usdot_compliance_requirements(usdot_application_id);

-- Insert default compliance requirements
INSERT OR IGNORE INTO usdot_compliance_requirements (usdot_application_id, requirement_type, requirement_name, is_required, cost) VALUES
(0, 'usdot_number', 'USDOT Number Application', TRUE, 0.00),
(0, 'compliance_monitoring', 'Compliance Monitoring Service', TRUE, 150.00),
(0, 'mc_authority', 'MC Authority (For-Hire Interstate)', FALSE, 300.00),
(0, 'ff_authority', 'FF Authority (Freight Forwarder)', FALSE, 250.00),
(0, 'broker_authority', 'Broker Authority', FALSE, 200.00),
(0, 'hazmat_authority', 'Hazmat Authority', FALSE, 100.00);

-- Create triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_usdot_applications_timestamp 
    AFTER UPDATE ON usdot_applications
    BEGIN
        UPDATE usdot_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Create view for application summary
CREATE VIEW IF NOT EXISTS usdot_application_summary AS
SELECT 
    ua.id,
    ua.company_name,
    ua.operation_type,
    ua.operation_radius,
    ua.application_status,
    ua.usdot_number,
    ua.mc_number,
    ua.total_cost,
    ua.payment_status,
    ua.created_at,
    COUNT(vd.id) as vehicle_count,
    COUNT(ct.id) as cargo_type_count,
    COUNT(cr.id) as requirement_count,
    COUNT(CASE WHEN cr.is_completed = 1 THEN 1 END) as completed_requirements
FROM usdot_applications ua
LEFT JOIN usdot_vehicle_details vd ON ua.id = vd.usdot_application_id
LEFT JOIN usdot_cargo_types ct ON ua.id = ct.usdot_application_id
LEFT JOIN usdot_compliance_requirements cr ON ua.id = cr.usdot_application_id
GROUP BY ua.id;
