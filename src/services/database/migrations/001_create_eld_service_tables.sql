-- ELD Service Tables for Transportation Compliance Agency
-- These tables support providing ELD compliance services to client companies
-- Integrated with existing rapid_crm.db schema

-- Client ELD Service Subscriptions
CREATE TABLE IF NOT EXISTS eld_service_subscriptions (
    id TEXT PRIMARY KEY,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    service_type TEXT NOT NULL, -- 'basic', 'premium', 'enterprise'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    start_date TEXT NOT NULL,
    end_date TEXT,
    monthly_fee REAL NOT NULL,
    setup_fee REAL DEFAULT 0,
    device_count INTEGER DEFAULT 0,
    driver_count INTEGER DEFAULT 0,
    features TEXT, -- Store service features as JSON string
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id)
);

-- ELD Devices assigned to clients
CREATE TABLE IF NOT EXISTS eld_devices (
    id TEXT PRIMARY KEY,
    device_serial TEXT UNIQUE NOT NULL,
    device_model TEXT NOT NULL,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    vehicle_id TEXT, -- Foreign key to existing vehicles table
    driver_id TEXT, -- Foreign key to existing drivers table
    installation_date TEXT,
    last_sync TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'maintenance', 'replaced'
    firmware_version TEXT,
    hardware_version TEXT,
    gps_enabled INTEGER DEFAULT 1, -- SQLite uses INTEGER for boolean
    bluetooth_enabled INTEGER DEFAULT 1,
    cellular_enabled INTEGER DEFAULT 1,
    data_retention_days INTEGER DEFAULT 365,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Driver ELD Logs (Hours of Service)
CREATE TABLE IF NOT EXISTS eld_driver_logs (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL, -- Foreign key to eld_devices table
    driver_id TEXT NOT NULL, -- Foreign key to existing drivers table
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    log_date TEXT NOT NULL,
    duty_status TEXT NOT NULL, -- 'off_duty', 'sleeper_berth', 'driving', 'on_duty'
    start_time TEXT NOT NULL,
    end_time TEXT,
    location_lat REAL,
    location_lng REAL,
    location_description TEXT,
    odometer_reading INTEGER,
    engine_hours REAL,
    vehicle_miles REAL,
    personal_use INTEGER DEFAULT 0, -- SQLite uses INTEGER for boolean
    yard_moves INTEGER DEFAULT 0,
    certified INTEGER DEFAULT 0,
    certification_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (device_id) REFERENCES eld_devices(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (client_company_id) REFERENCES companies(id)
);

-- ELD Violations and Alerts
CREATE TABLE IF NOT EXISTS eld_violations (
    id TEXT PRIMARY KEY,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    driver_id TEXT NOT NULL, -- Foreign key to existing drivers table
    device_id TEXT NOT NULL, -- Foreign key to eld_devices table
    violation_type TEXT NOT NULL, -- 'hos_violation', 'form_missing', 'data_missing', 'device_malfunction'
    violation_code TEXT,
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    violation_date TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'dismissed'
    resolution_notes TEXT,
    resolved_at TEXT,
    resolved_by TEXT, -- User ID who resolved the violation
    fmcsa_reportable INTEGER DEFAULT 0, -- SQLite uses INTEGER for boolean
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (device_id) REFERENCES eld_devices(id)
);

-- ELD Service Billing and Usage
CREATE TABLE IF NOT EXISTS eld_service_billing (
    id TEXT PRIMARY KEY,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    subscription_id TEXT NOT NULL, -- Foreign key to eld_service_subscriptions table
    billing_period_start TEXT NOT NULL,
    billing_period_end TEXT NOT NULL,
    base_fee REAL NOT NULL,
    device_fees REAL DEFAULT 0,
    driver_fees REAL DEFAULT 0,
    data_usage_fees REAL DEFAULT 0,
    support_fees REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    payment_date TEXT,
    invoice_number TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id),
    FOREIGN KEY (subscription_id) REFERENCES eld_service_subscriptions(id)
);

-- ELD Compliance Reports
CREATE TABLE IF NOT EXISTS eld_compliance_reports (
    id TEXT PRIMARY KEY,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    report_type TEXT NOT NULL, -- 'daily_summary', 'weekly_summary', 'monthly_summary', 'violation_report', 'audit_report'
    report_period_start TEXT NOT NULL,
    report_period_end TEXT NOT NULL,
    generated_by TEXT NOT NULL, -- User ID who generated the report
    report_data TEXT NOT NULL, -- Store report data as JSON string
    file_path TEXT,
    status TEXT DEFAULT 'generated', -- 'generated', 'sent', 'viewed', 'archived'
    sent_at TEXT,
    viewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id)
);

-- ELD Service Analytics
CREATE TABLE IF NOT EXISTS eld_service_analytics (
    id TEXT PRIMARY KEY,
    client_company_id TEXT NOT NULL, -- Foreign key to existing companies table
    metric_date TEXT NOT NULL,
    total_drivers INTEGER DEFAULT 0,
    total_devices INTEGER DEFAULT 0,
    active_devices INTEGER DEFAULT 0,
    total_violations INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    data_sync_success_rate REAL DEFAULT 0,
    device_uptime_percentage REAL DEFAULT 0,
    support_tickets INTEGER DEFAULT 0,
    client_satisfaction_score REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_company_id) REFERENCES companies(id),
    UNIQUE(client_company_id, metric_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eld_subscriptions_client ON eld_service_subscriptions(client_company_id);
CREATE INDEX IF NOT EXISTS idx_eld_subscriptions_status ON eld_service_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_eld_devices_client ON eld_devices(client_company_id);
CREATE INDEX IF NOT EXISTS idx_eld_devices_serial ON eld_devices(device_serial);
CREATE INDEX IF NOT EXISTS idx_eld_logs_driver_date ON eld_driver_logs(driver_id, log_date);
CREATE INDEX IF NOT EXISTS idx_eld_logs_device_date ON eld_driver_logs(device_id, log_date);
CREATE INDEX IF NOT EXISTS idx_eld_violations_client ON eld_violations(client_company_id);
CREATE INDEX IF NOT EXISTS idx_eld_violations_driver ON eld_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_eld_violations_status ON eld_violations(status);
CREATE INDEX IF NOT EXISTS idx_eld_billing_client ON eld_service_billing(client_company_id);
CREATE INDEX IF NOT EXISTS idx_eld_billing_period ON eld_service_billing(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_eld_reports_client ON eld_compliance_reports(client_company_id);
CREATE INDEX IF NOT EXISTS idx_eld_analytics_client_date ON eld_service_analytics(client_company_id, metric_date);
