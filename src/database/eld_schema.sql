-- ELD Database Schema Extension for rapid_crm.db
-- This extends the existing CRM database with ELD compliance functionality
-- Based on Foley compliance services and TCS managed services models

-- ===== CORE ELD FUNCTIONALITY =====

-- Hours of Service (HOS) Logs
CREATE TABLE IF NOT EXISTS eld_hos_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT,
    log_type TEXT NOT NULL, -- 'driving', 'on_duty', 'off_duty', 'sleeper_berth'
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location TEXT,
    odometer_reading INTEGER,
    is_edited BOOLEAN DEFAULT 0,
    edit_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Driver Vehicle Inspection Reports (DVIR)
CREATE TABLE IF NOT EXISTS eld_dvir_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    inspection_type TEXT NOT NULL, -- 'pre_trip', 'post_trip', 'intermediate'
    inspection_date DATETIME NOT NULL,
    defects TEXT, -- JSON array of defects
    is_safe_to_drive BOOLEAN NOT NULL,
    signature TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ELD Alerts and Notifications
CREATE TABLE IF NOT EXISTS eld_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'hos_violation', 'dvir_defect', 'device_malfunction', 'unidentified_driver'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_resolved BOOLEAN DEFAULT 0,
    resolved_at DATETIME,
    resolved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== FOLEY-STYLE COMPLIANCE SERVICES =====

-- Compliance Service Packages
CREATE TABLE IF NOT EXISTS compliance_services (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'ELD_Software', 'DOT_Compliance', 'Driver_Management', 'Audit_Support'
    service_level TEXT NOT NULL, -- 'basic', 'standard', 'premium', 'enterprise'
    status TEXT DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    start_date DATETIME NOT NULL,
    renewal_date DATETIME NOT NULL,
    monthly_cost DECIMAL(10,2) DEFAULT 0,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    features TEXT, -- JSON array of features
    compliance_requirements TEXT, -- JSON array of requirements
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Driver Qualification Files (DQF)
CREATE TABLE IF NOT EXISTS driver_qualification_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'current', 'expired', 'pending_review'
    last_review_date DATETIME,
    next_review_date DATETIME,
    documents TEXT, -- JSON array of document references
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DOT Drug & Alcohol Testing Records
CREATE TABLE IF NOT EXISTS drug_alcohol_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'pre_employment', 'random', 'post_accident', 'reasonable_suspicion', 'return_to_duty', 'follow_up'
    test_date DATETIME NOT NULL,
    result TEXT NOT NULL, -- 'negative', 'positive', 'refusal', 'invalid'
    mro_report_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FMCSA Clearinghouse Records
CREATE TABLE IF NOT EXISTS fmcsa_clearinghouse_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    query_date DATETIME NOT NULL,
    violation_type TEXT,
    status TEXT NOT NULL, -- 'clear', 'violation_found', 'pending'
    full_query_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DOT Physical Examinations
CREATE TABLE IF NOT EXISTS dot_physicals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    exam_date DATETIME NOT NULL,
    expiry_date DATETIME NOT NULL,
    medical_certificate_url TEXT,
    status TEXT NOT NULL, -- 'current', 'expired', 'pending'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== TCS-STYLE BUSINESS REGISTRATION SERVICES =====

-- USDOT Number Management
CREATE TABLE IF NOT EXISTS usdot_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    usdot_number TEXT UNIQUE,
    status TEXT NOT NULL, -- 'active', 'inactive', 'suspended', 'pending'
    registration_date DATETIME,
    expiry_date DATETIME,
    biennial_update_due DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- MC Number & BOC-3 Management
CREATE TABLE IF NOT EXISTS mc_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    mc_number TEXT UNIQUE,
    status TEXT NOT NULL, -- 'active', 'inactive', 'suspended', 'pending'
    boc3_filed BOOLEAN DEFAULT 0,
    boc3_filing_date DATETIME,
    boc3_expiry_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IFTA Registration and Quarterly Filings
CREATE TABLE IF NOT EXISTS ifta_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    ifta_account_number TEXT,
    status TEXT NOT NULL, -- 'active', 'inactive', 'suspended'
    registration_date DATETIME,
    renewal_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ifta_quarterly_filings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    quarter_year INTEGER NOT NULL,
    quarter_number INTEGER NOT NULL, -- 1, 2, 3, 4
    filing_deadline DATETIME NOT NULL,
    filing_status TEXT NOT NULL, -- 'pending', 'filed', 'late', 'exempt'
    total_miles INTEGER DEFAULT 0,
    taxable_miles INTEGER DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    filing_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IRP Registration and Renewals
CREATE TABLE IF NOT EXISTS irp_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    irp_account_number TEXT,
    status TEXT NOT NULL, -- 'active', 'inactive', 'suspended'
    registration_date DATETIME,
    renewal_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IRS 2290 / Heavy Vehicle Use Tax
CREATE TABLE IF NOT EXISTS irs2290_filings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    filing_deadline DATETIME NOT NULL,
    filing_status TEXT NOT NULL, -- 'pending', 'filed', 'late'
    total_vehicles INTEGER DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    filing_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== COMPLIANCE MONITORING =====

-- Compliance Alerts and Violations
CREATE TABLE IF NOT EXISTS compliance_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'hos_violation', 'dvir_defect', 'expired_license', 'missing_documentation'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    acknowledged_by TEXT,
    acknowledged_at DATETIME,
    resolved_by TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Violations
CREATE TABLE IF NOT EXISTS compliance_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    driver_id TEXT,
    violation_type TEXT NOT NULL,
    violation_date DATETIME NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'minor', 'major', 'severe'
    status TEXT DEFAULT 'open', -- 'open', 'under_review', 'resolved', 'appealed'
    fine_amount DECIMAL(10,2) DEFAULT 0,
    resolution_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== GEOTAB INTEGRATION =====

-- Geotab Device Configuration
CREATE TABLE IF NOT EXISTS geotab_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    device_id TEXT UNIQUE,
    device_name TEXT,
    vehicle_id TEXT,
    driver_id TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_sync DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Geotab API Credentials
CREATE TABLE IF NOT EXISTS geotab_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT NOT NULL,
    server_name TEXT NOT NULL,
    database_name TEXT NOT NULL,
    username TEXT NOT NULL,
    session_id TEXT,
    session_expiry DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES FOR PERFORMANCE =====

-- HOS Logs Indexes
CREATE INDEX IF NOT EXISTS idx_hos_logs_driver ON eld_hos_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_hos_logs_vehicle ON eld_hos_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_hos_logs_type ON eld_hos_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_hos_logs_start_time ON eld_hos_logs(start_time);

-- DVIR Reports Indexes
CREATE INDEX IF NOT EXISTS idx_dvir_driver ON eld_dvir_reports(driver_id);
CREATE INDEX IF NOT EXISTS idx_dvir_vehicle ON eld_dvir_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dvir_inspection_date ON eld_dvir_reports(inspection_date);
CREATE INDEX IF NOT EXISTS idx_dvir_type ON eld_dvir_reports(inspection_type);

-- Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_driver ON eld_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON eld_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON eld_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON eld_alerts(is_resolved);

-- Compliance Services Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_services_company ON compliance_services(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_services_type ON compliance_services(service_type);
CREATE INDEX IF NOT EXISTS idx_compliance_services_level ON compliance_services(service_level);
CREATE INDEX IF NOT EXISTS idx_compliance_services_status ON compliance_services(status);

-- Driver Qualification Files Indexes
CREATE INDEX IF NOT EXISTS idx_dqf_driver ON driver_qualification_files(driver_id);
CREATE INDEX IF NOT EXISTS idx_dqf_company ON driver_qualification_files(company_id);
CREATE INDEX IF NOT EXISTS idx_dqf_status ON driver_qualification_files(status);
CREATE INDEX IF NOT EXISTS idx_dqf_next_review ON driver_qualification_files(next_review_date);

-- Drug & Alcohol Tests Indexes
CREATE INDEX IF NOT EXISTS idx_drug_tests_driver ON drug_alcohol_tests(driver_id);
CREATE INDEX IF NOT EXISTS idx_drug_tests_company ON drug_alcohol_tests(company_id);
CREATE INDEX IF NOT EXISTS idx_drug_tests_type ON drug_alcohol_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_drug_tests_date ON drug_alcohol_tests(test_date);

-- FMCSA Clearinghouse Indexes
CREATE INDEX IF NOT EXISTS idx_clearinghouse_driver ON fmcsa_clearinghouse_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_clearinghouse_company ON fmcsa_clearinghouse_records(company_id);
CREATE INDEX IF NOT EXISTS idx_clearinghouse_query_date ON fmcsa_clearinghouse_records(query_date);

-- DOT Physicals Indexes
CREATE INDEX IF NOT EXISTS idx_physicals_driver ON dot_physicals(driver_id);
CREATE INDEX IF NOT EXISTS idx_physicals_company ON dot_physicals(company_id);
CREATE INDEX IF NOT EXISTS idx_physicals_expiry ON dot_physicals(expiry_date);

-- USDOT Registrations Indexes
CREATE INDEX IF NOT EXISTS idx_usdot_company ON usdot_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_usdot_number ON usdot_registrations(usdot_number);
CREATE INDEX IF NOT EXISTS idx_usdot_status ON usdot_registrations(status);

-- MC Registrations Indexes
CREATE INDEX IF NOT EXISTS idx_mc_company ON mc_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_mc_number ON mc_registrations(mc_number);
CREATE INDEX IF NOT EXISTS idx_mc_status ON mc_registrations(status);

-- IFTA Indexes
CREATE INDEX IF NOT EXISTS idx_ifta_company ON ifta_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_company ON ifta_quarterly_filings(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_year ON ifta_quarterly_filings(quarter_year, quarter_number);

-- IRP Indexes
CREATE INDEX IF NOT EXISTS idx_irp_company ON irp_registrations(company_id);

-- IRS 2290 Indexes
CREATE INDEX IF NOT EXISTS idx_irs2290_company ON irs2290_filings(company_id);
CREATE INDEX IF NOT EXISTS idx_irs2290_year ON irs2290_filings(tax_year);

-- Compliance Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_company ON compliance_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_type ON compliance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON compliance_alerts(status);

-- Compliance Violations Indexes
CREATE INDEX IF NOT EXISTS idx_violations_company ON compliance_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_violations_driver ON compliance_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_violations_type ON compliance_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_date ON compliance_violations(violation_date);

-- Geotab Indexes
CREATE INDEX IF NOT EXISTS idx_geotab_devices_company ON geotab_devices(company_id);
CREATE INDEX IF NOT EXISTS idx_geotab_devices_vehicle ON geotab_devices(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_geotab_credentials_company ON geotab_credentials(company_id);
