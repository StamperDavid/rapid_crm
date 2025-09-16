-- ELD Service Integration Schema Extensions
-- Extends the existing CRM schema for compliance service tracking

-- Service Renewal Tracking Table
CREATE TABLE IF NOT EXISTS service_renewals (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    
    -- Renewal Information
    renewal_type TEXT NOT NULL, -- 'annual', 'quarterly', 'monthly', 'custom'
    renewal_frequency INTEGER NOT NULL, -- Days between renewals
    
    -- Current Status
    current_expiry_date TEXT NOT NULL,
    next_renewal_date TEXT NOT NULL,
    renewal_status TEXT DEFAULT 'active', -- 'active', 'pending', 'overdue', 'cancelled'
    
    -- Automation Settings
    auto_renewal_enabled INTEGER DEFAULT 0, -- 0 = false, 1 = true
    reminder_days_before INTEGER DEFAULT 30, -- Days before expiry to send reminders
    grace_period_days INTEGER DEFAULT 0, -- Grace period after expiry
    
    -- Compliance Tracking
    compliance_required INTEGER DEFAULT 1, -- 0 = false, 1 = true
    regulatory_body TEXT, -- 'FMCSA', 'DOT', 'IFTA', 'IRP', etc.
    compliance_document_url TEXT,
    
    -- Financial Tracking
    renewal_cost REAL,
    last_renewal_cost REAL,
    cost_increase_percentage REAL DEFAULT 0,
    
    -- AI Agent Integration
    agent_assigned TEXT, -- Foreign key to agents table
    automation_rules TEXT, -- JSON object for AI agent rules
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (agent_assigned) REFERENCES agents(id)
);

-- ELD-Specific Services Table
CREATE TABLE IF NOT EXISTS eld_services (
    id TEXT PRIMARY KEY,
    service_renewal_id TEXT NOT NULL,
    
    -- ELD Service Details
    service_type TEXT NOT NULL, -- 'ELD_Hardware', 'ELD_Software', 'ELD_Support', 'HOS_Training', 'Compliance_Monitoring'
    provider_name TEXT NOT NULL,
    provider_contact TEXT,
    
    -- Hardware/Software Details
    device_model TEXT,
    software_version TEXT,
    installation_date TEXT,
    
    -- Service Level
    service_level TEXT DEFAULT 'standard', -- 'basic', 'standard', 'premium', 'enterprise'
    support_hours TEXT, -- '24/7', 'business_hours', 'extended'
    
    -- Integration Details
    api_endpoint TEXT,
    api_key TEXT, -- Encrypted
    integration_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'failed', 'disconnected'
    
    -- Compliance Metrics
    uptime_percentage REAL DEFAULT 100.0,
    violation_count INTEGER DEFAULT 0,
    last_compliance_check TEXT,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (service_renewal_id) REFERENCES service_renewals(id)
);

-- IFTA Quarterly Tracking Table
CREATE TABLE IF NOT EXISTS ifta_quarterly_renewals (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    service_renewal_id TEXT NOT NULL,
    
    -- Quarter Information
    quarter_year INTEGER NOT NULL, -- 2024
    quarter_number INTEGER NOT NULL, -- 1, 2, 3, 4
    
    -- Filing Dates
    filing_deadline TEXT NOT NULL, -- Due date for filing
    filing_date TEXT, -- Actual filing date
    filing_status TEXT DEFAULT 'pending', -- 'pending', 'filed', 'late', 'extension'
    
    -- Mileage and Tax Data
    total_miles INTEGER DEFAULT 0,
    taxable_miles INTEGER DEFAULT 0,
    total_tax_due REAL DEFAULT 0,
    total_tax_paid REAL DEFAULT 0,
    
    -- Documents
    filing_document_url TEXT,
    receipt_document_url TEXT,
    
    -- AI Agent Tracking
    agent_notifications_sent INTEGER DEFAULT 0,
    last_reminder_date TEXT,
    automation_completed INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (service_renewal_id) REFERENCES service_renewals(id)
);

-- Service Automation Rules Table
CREATE TABLE IF NOT EXISTS service_automation_rules (
    id TEXT PRIMARY KEY,
    service_renewal_id TEXT NOT NULL,
    
    -- Rule Configuration
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'reminder', 'auto_renewal', 'compliance_check', 'escalation'
    
    -- Trigger Conditions
    trigger_days_before INTEGER, -- Days before expiry
    trigger_conditions TEXT, -- JSON object with conditions
    
    -- Actions
    action_type TEXT NOT NULL, -- 'send_email', 'create_task', 'update_status', 'notify_agent'
    action_parameters TEXT, -- JSON object with action details
    
    -- AI Agent Integration
    agent_id TEXT NOT NULL,
    ai_prompt_template TEXT, -- Template for AI agent prompts
    ai_context_data TEXT, -- JSON object with context for AI
    
    -- Rule Status
    is_active INTEGER DEFAULT 1,
    last_triggered TEXT,
    trigger_count INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (service_renewal_id) REFERENCES service_renewals(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Service Compliance Alerts Table
CREATE TABLE IF NOT EXISTS service_compliance_alerts (
    id TEXT PRIMARY KEY,
    service_renewal_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    
    -- Alert Information
    alert_type TEXT NOT NULL, -- 'renewal_due', 'renewal_overdue', 'compliance_violation', 'service_disruption'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    
    -- Alert Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recommended_actions TEXT, -- JSON array
    
    -- Status Tracking
    status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    resolved_at TEXT,
    
    -- AI Agent Integration
    agent_generated INTEGER DEFAULT 0, -- 0 = false, 1 = true
    agent_id TEXT, -- Agent that generated or is handling this alert
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (service_renewal_id) REFERENCES service_renewals(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_renewals_company ON service_renewals(company_id);
CREATE INDEX IF NOT EXISTS idx_service_renewals_expiry ON service_renewals(next_renewal_date);
CREATE INDEX IF NOT EXISTS idx_service_renewals_status ON service_renewals(renewal_status);
CREATE INDEX IF NOT EXISTS idx_service_renewals_agent ON service_renewals(agent_assigned);

CREATE INDEX IF NOT EXISTS idx_eld_services_renewal ON eld_services(service_renewal_id);
CREATE INDEX IF NOT EXISTS idx_eld_services_type ON eld_services(service_type);
CREATE INDEX IF NOT EXISTS idx_eld_services_status ON eld_services(integration_status);

CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_company ON ifta_quarterly_renewals(company_id);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_year_quarter ON ifta_quarterly_renewals(quarter_year, quarter_number);
CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_deadline ON ifta_quarterly_renewals(filing_deadline);

CREATE INDEX IF NOT EXISTS idx_automation_rules_service ON service_automation_rules(service_renewal_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_agent ON service_automation_rules(agent_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON service_automation_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_service ON service_compliance_alerts(service_renewal_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_company ON service_compliance_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON service_compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON service_compliance_alerts(status);



