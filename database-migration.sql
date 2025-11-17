-- ============================================================================
-- DATABASE MIGRATION: Add Credential Management Columns & Tables
-- Run this in your SQLite database
-- ============================================================================

-- Step 1: Add Login.gov credential columns to users table
ALTER TABLE users ADD COLUMN login_gov_username TEXT;
ALTER TABLE users ADD COLUMN login_gov_password_encrypted TEXT;
ALTER TABLE users ADD COLUMN login_gov_mfa_method TEXT DEFAULT 'sms';
ALTER TABLE users ADD COLUMN login_gov_mfa_phone TEXT;
ALTER TABLE users ADD COLUMN login_gov_backup_codes_encrypted TEXT;
ALTER TABLE users ADD COLUMN fmcsa_account_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN fmcsa_verification_date TEXT;
ALTER TABLE users ADD COLUMN last_credential_update TEXT;

-- Step 2: Create employee_identity_documents table
CREATE TABLE IF NOT EXISTS employee_identity_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    
    -- ID Document Details
    id_document_type TEXT NOT NULL,
    id_document_number TEXT,
    id_expiration_date TEXT,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    date_of_birth TEXT NOT NULL,
    
    -- File Paths
    id_document_front_path TEXT NOT NULL,
    id_document_back_path TEXT,
    selfie_path TEXT,
    
    -- IDEMIA Verification Status
    idemia_verification_status TEXT DEFAULT 'not_verified',
    idemia_verification_date TEXT,
    idemia_verification_id TEXT,
    idemia_verification_result TEXT,
    idemia_failure_reason TEXT,
    
    -- Metadata
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_identity_employee_id ON employee_identity_documents(employee_id);
CREATE INDEX idx_employee_identity_verification_status ON employee_identity_documents(idemia_verification_status);
CREATE INDEX idx_employee_identity_active ON employee_identity_documents(employee_id, is_active);

-- Step 3: Create admin_idemia_verifications table
CREATE TABLE IF NOT EXISTS admin_idemia_verifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    deal_id TEXT,
    rpa_instance_id TEXT,
    
    -- Verification Details
    verification_type TEXT NOT NULL,
    verification_method TEXT DEFAULT 'idemia',
    
    -- Status
    status TEXT DEFAULT 'pending',
    started_at TEXT NOT NULL,
    completed_at TEXT,
    
    -- IDEMIA Session Details
    idemia_session_id TEXT,
    idemia_session_url TEXT,
    idemia_result TEXT,
    
    -- Admin Actions
    admin_id TEXT,
    admin_notes TEXT,
    manual_override INTEGER DEFAULT 0,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    duration_seconds INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_idemia_employee_id ON admin_idemia_verifications(employee_id);
CREATE INDEX idx_admin_idemia_deal_id ON admin_idemia_verifications(deal_id);
CREATE INDEX idx_admin_idemia_status ON admin_idemia_verifications(status);
CREATE INDEX idx_admin_idemia_started_at ON admin_idemia_verifications(started_at);

-- Step 4: Create credential_access_log table
CREATE TABLE IF NOT EXISTS credential_access_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    
    -- What was accessed
    employee_id TEXT NOT NULL,
    credential_type TEXT NOT NULL,
    
    -- Who/What accessed it
    accessed_by_type TEXT NOT NULL,
    accessed_by_id TEXT,
    
    -- Context
    purpose TEXT NOT NULL,
    deal_id TEXT,
    rpa_instance_id TEXT,
    
    -- Access Details
    access_granted INTEGER DEFAULT 1,
    denial_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_credential_access_timestamp ON credential_access_log(timestamp);
CREATE INDEX idx_credential_access_employee_id ON credential_access_log(employee_id);
CREATE INDEX idx_credential_access_type ON credential_access_log(accessed_by_type);

-- Step 5: Create credential_rotation_schedule table
CREATE TABLE IF NOT EXISTS credential_rotation_schedule (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    
    -- Rotation Policy
    credential_type TEXT NOT NULL,
    rotation_frequency_days INTEGER DEFAULT 90,
    
    -- Tracking
    last_rotated TEXT,
    next_rotation_due TEXT,
    rotation_reminder_sent INTEGER DEFAULT 0,
    
    -- Status
    is_overdue INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_rotation_schedule_employee_id ON credential_rotation_schedule(employee_id);
CREATE INDEX idx_rotation_schedule_next_due ON credential_rotation_schedule(next_rotation_due);
CREATE INDEX idx_rotation_schedule_overdue ON credential_rotation_schedule(is_overdue);

-- Step 6: Create rpa_audit_trail table
CREATE TABLE IF NOT EXISTS rpa_audit_trail (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    
    -- Action Details
    action_type TEXT NOT NULL,
    
    -- Context
    deal_id TEXT NOT NULL,
    employee_id TEXT,
    rpa_instance_id TEXT NOT NULL,
    
    -- Page/Step Information
    page_number INTEGER,
    page_url TEXT,
    field_name TEXT,
    field_value_hash TEXT,
    
    -- Evidence
    screenshot_path TEXT,
    
    -- Result
    success INTEGER DEFAULT 1,
    error_message TEXT,
    error_stack TEXT,
    
    -- System Information
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    
    -- Performance
    duration_ms INTEGER,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_deal_id ON rpa_audit_trail(deal_id);
CREATE INDEX idx_audit_timestamp ON rpa_audit_trail(timestamp);
CREATE INDEX idx_audit_rpa_instance ON rpa_audit_trail(rpa_instance_id);
CREATE INDEX idx_audit_action_type ON rpa_audit_trail(action_type);
CREATE INDEX idx_audit_success ON rpa_audit_trail(success);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify users table has new columns
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='users';

-- Verify new tables exist
-- SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%credential%' OR name LIKE '%idemia%' OR name LIKE '%audit%';

-- Count records (should be 0 initially)
-- SELECT COUNT(*) FROM employee_identity_documents;
-- SELECT COUNT(*) FROM admin_idemia_verifications;
-- SELECT COUNT(*) FROM credential_access_log;
-- SELECT COUNT(*) FROM credential_rotation_schedule;
-- SELECT COUNT(*) FROM rpa_audit_trail;

