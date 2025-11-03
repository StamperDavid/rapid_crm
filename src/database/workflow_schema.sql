-- Workflow Automation Database Schema
-- Stores workflow queue and execution history

-- Workflow Queue Table
CREATE TABLE IF NOT EXISTS workflow_queue (
    id TEXT PRIMARY KEY,
    workflow_type TEXT NOT NULL, -- 'usdot_filing', 'mc_filing', 'renewal_reminder', 'document_generation'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'canceled'
    
    -- Business References
    deal_id TEXT,
    company_id TEXT NOT NULL,
    payment_transaction_id TEXT, -- Reference to payment_transactions
    
    -- Workflow Data
    input_data TEXT NOT NULL, -- JSON: all data needed for workflow (company info, services, etc.)
    output_data TEXT, -- JSON: results from workflow execution
    
    -- Agent Assignment
    assigned_agent TEXT, -- Which RPA agent is handling it ('usdot_rpa', 'mc_rpa', etc.)
    agent_version TEXT, -- Version of agent used
    
    -- Execution Tracking
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT, -- Last error message if failed
    requires_human_intervention INTEGER DEFAULT 0, -- 0 = no, 1 = yes
    intervention_reason TEXT, -- Why human intervention is needed
    
    -- Timestamps
    created_at TEXT NOT NULL,
    scheduled_for TEXT, -- When to process (for delayed workflows)
    started_at TEXT, -- When processing began
    completed_at TEXT, -- When processing finished
    failed_at TEXT, -- When workflow failed
    next_retry_at TEXT, -- When to retry if failed
    
    -- System Fields
    created_by TEXT DEFAULT 'system', -- Who/what created this workflow
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id)
);

-- Workflow Execution Log
CREATE TABLE IF NOT EXISTS workflow_execution_log (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    
    step_name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'skipped'
    
    input_data TEXT, -- JSON: input for this step
    output_data TEXT, -- JSON: output from this step
    error_message TEXT,
    
    started_at TEXT NOT NULL,
    completed_at TEXT,
    duration_ms INTEGER, -- Duration in milliseconds
    
    FOREIGN KEY (workflow_id) REFERENCES workflow_queue(id)
);

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id TEXT PRIMARY KEY,
    workflow_type TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Template Definition
    steps TEXT NOT NULL, -- JSON array: [{ step: 'collect_data', agent: 'usdot_rpa', ... }]
    required_fields TEXT, -- JSON array: ['company_id', 'ein', 'fleet_info', ...]
    expected_duration INTEGER, -- Estimated duration in seconds
    
    -- Configuration
    is_active INTEGER DEFAULT 1,
    allow_parallel INTEGER DEFAULT 0, -- Can multiple instances run simultaneously?
    requires_payment INTEGER DEFAULT 1, -- Must be paid before execution?
    
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Workflow Triggers
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id TEXT PRIMARY KEY,
    trigger_type TEXT NOT NULL, -- 'payment.completed', 'service.purchased', 'renewal.due', 'manual'
    workflow_type TEXT NOT NULL, -- Which workflow to trigger
    
    -- Trigger Conditions
    conditions TEXT, -- JSON: conditions that must be met
    is_active INTEGER DEFAULT 1,
    
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (workflow_type) REFERENCES workflow_templates(workflow_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_queue_status ON workflow_queue(status);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_type ON workflow_queue(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_company ON workflow_queue(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_deal ON workflow_queue(deal_id);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_priority ON workflow_queue(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_scheduled ON workflow_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_workflow ON workflow_execution_log(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_status ON workflow_execution_log(status);

-- Insert default workflow templates
INSERT OR IGNORE INTO workflow_templates (id, workflow_type, name, description, steps, required_fields, expected_duration, is_active, requires_payment, created_at, updated_at) VALUES
('tpl_usdot', 'usdot_filing', 'USDOT Number Filing', 'File USDOT application with FMCSA', 
'[{"step": "validate_data", "agent": "validation"}, {"step": "fill_form", "agent": "usdot_rpa"}, {"step": "submit_form", "agent": "usdot_rpa"}, {"step": "verify_submission", "agent": "usdot_rpa"}, {"step": "send_confirmation", "agent": "notification"}]',
'["company_id", "legal_business_name", "ein", "physical_address", "fleet_info", "operation_type"]',
300, 1, 1, datetime('now'), datetime('now')),

('tpl_mc', 'mc_filing', 'MC Number Filing', 'File MC number application with FMCSA',
'[{"step": "validate_data", "agent": "validation"}, {"step": "fill_form", "agent": "mc_rpa"}, {"step": "submit_form", "agent": "mc_rpa"}, {"step": "verify_submission", "agent": "mc_rpa"}, {"step": "send_confirmation", "agent": "notification"}]',
'["company_id", "usdot_number", "operating_authority", "insurance_info", "boc3_filing"]',
600, 1, 1, datetime('now'), datetime('now')),

('tpl_renewal', 'renewal_reminder', 'Renewal Reminder', 'Send renewal reminder to client',
'[{"step": "check_renewal_date", "agent": "system"}, {"step": "send_email", "agent": "notification"}, {"step": "send_sms", "agent": "notification"}, {"step": "update_status", "agent": "system"}]',
'["company_id", "service_id", "renewal_date"]',
30, 1, 0, datetime('now'), datetime('now'));

-- Insert default workflow triggers
INSERT OR IGNORE INTO workflow_triggers (id, trigger_type, workflow_type, conditions, is_active, created_at, updated_at) VALUES
('trigger_usdot', 'payment.completed', 'usdot_filing', '{"services": ["USDOT", "usdot", "USDOT Registration"]}', 1, datetime('now'), datetime('now')),
('trigger_mc', 'payment.completed', 'mc_filing', '{"services": ["MC", "mc", "MC Number", "Operating Authority"]}', 1, datetime('now'), datetime('now')),
('trigger_renewal', 'renewal.due', 'renewal_reminder', '{"days_before": [90, 60, 30, 7]}', 1, datetime('now'), datetime('now'));

