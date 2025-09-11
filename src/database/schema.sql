-- Rapid CRM Database Schema
-- SQLite Database Schema for Transportation CRM

-- Companies/Organizations Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    -- Physical Address
    physical_street_address TEXT,
    physical_suite_apt TEXT,
    physical_city TEXT,
    physical_state TEXT,
    physical_country TEXT DEFAULT 'United States',
    physical_zip TEXT,
    
    -- Mailing Address
    is_mailing_address_same TEXT DEFAULT 'Yes',
    mailing_street_address TEXT,
    mailing_suite_apt TEXT,
    mailing_city TEXT,
    mailing_state TEXT,
    mailing_country TEXT DEFAULT 'United States',
    mailing_zip TEXT,
    
    -- Business Information
    legal_business_name TEXT NOT NULL,
    has_dba TEXT DEFAULT 'No',
    dba_name TEXT,
    business_type TEXT,
    ein TEXT,
    business_started DATE,
    
    -- Transportation Details
    classification TEXT,
    operation_type TEXT,
    interstate_intrastate TEXT,
    usdot_number TEXT,
    operation_class TEXT,
    
    -- Fleet Information
    fleet_type TEXT,
    number_of_vehicles INTEGER DEFAULT 0,
    number_of_drivers INTEGER DEFAULT 0,
    gvwr TEXT,
    vehicle_types TEXT,
    
    -- Cargo & Safety
    cargo_types TEXT,
    hazmat_required TEXT DEFAULT 'No',
    phmsa_work TEXT DEFAULT 'No',
    regulatory_details TEXT, -- JSON array
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE
);

-- Contacts/People Table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    preferred_contact_method TEXT DEFAULT 'Phone',
    is_primary_contact BOOLEAN DEFAULT FALSE,
    position TEXT,
    department TEXT,
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    vin TEXT UNIQUE,
    license_plate TEXT,
    make TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    vehicle_type TEXT,
    gvwr TEXT,
    fuel_type TEXT,
    status TEXT DEFAULT 'Active',
    has_hazmat_endorsement TEXT DEFAULT 'No',
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    
    -- Driver Information
    driver_name TEXT NOT NULL,
    
    -- Application & Documentation
    application_for_employment TEXT,
    background_checks TEXT,
    certificate_of_receipt_for_company_testing_policy TEXT,
    certificate_of_receipt_for_company_work_policy TEXT,
    commercial_drivers_license_information_system_reports TEXT,
    copy_of_drivers_license TEXT,
    medical_certificate_copy TEXT,
    
    -- Disciplinary & Safety Records
    disciplinary_action TEXT,
    good_faith_effort_inquiry_into_driving_record TEXT,
    good_faith_effort_safety_performance_history_investigation TEXT,
    inquiry_into_driving_record TEXT,
    inquiry_to_previous_employers TEXT,
    medical_examiner_national_registry_verification TEXT,
    motor_vehicle_reports TEXT,
    
    -- Employment Documentation
    driver_employment_application TEXT,
    drivers_road_test TEXT,
    certification_of_road_test TEXT,
    annual_drivers_certificate_of_violations TEXT,
    annual_review_of_driving_record TEXT,
    checklist_for_multiple_employers TEXT,
    
    -- Legacy fields (keeping for backward compatibility)
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    ssn TEXT, -- Encrypted
    phone TEXT,
    email TEXT,
    address TEXT,
    license_number TEXT,
    license_state TEXT,
    license_class TEXT,
    license_expiry DATE,
    has_hazmat_endorsement TEXT DEFAULT 'No',
    has_passenger_endorsement TEXT DEFAULT 'No',
    has_school_bus_endorsement TEXT DEFAULT 'No',
    hire_date DATE,
    employment_status TEXT DEFAULT 'Active',
    position TEXT,
    pay_type TEXT,
    medical_card_number TEXT,
    medical_card_expiry DATE,
    drug_test_date DATE,
    next_drug_test_due DATE,
    background_check_date DATE,
    next_background_check_due DATE,
    total_miles_driven INTEGER DEFAULT 0,
    accidents_in_last_3_years INTEGER DEFAULT 0,
    violations_in_last_3_years INTEGER DEFAULT 0,
    safety_rating TEXT,
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    contact_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    stage TEXT DEFAULT 'Prospecting',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    source TEXT,
    type TEXT,
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    deal_id TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'Draft',
    issue_date DATE,
    due_date DATE,
    paid_date DATE,
    payment_method TEXT,
    notes TEXT,
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    contact_id TEXT,
    deal_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Not Started',
    priority TEXT DEFAULT 'Medium',
    due_date DATE,
    completed_date DATE,
    assigned_to TEXT,
    created_by TEXT,
    
    -- System Fields
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_legal_name ON companies(legal_business_name);
CREATE INDEX IF NOT EXISTS idx_companies_usdot ON companies(usdot_number);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON contacts(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
