-- ============================================================================
-- CREDENTIAL MANAGEMENT SCHEMA
-- For storing Login.gov credentials and employee identity documents
-- ============================================================================

-- Add Login.gov credential fields to users table
-- (Users table already exists, we're just adding columns)

-- Check if columns exist before adding (SQLite doesn't have IF NOT EXISTS for ALTER TABLE)
-- You'll need to run this manually or handle in migration script

-- Example migration (run in server.js initialization):
/*
ALTER TABLE users ADD COLUMN login_gov_username TEXT;
ALTER TABLE users ADD COLUMN login_gov_password_encrypted TEXT;
ALTER TABLE users ADD COLUMN login_gov_mfa_method TEXT DEFAULT 'sms';
ALTER TABLE users ADD COLUMN login_gov_mfa_phone TEXT;
ALTER TABLE users ADD COLUMN login_gov_backup_codes_encrypted TEXT;
ALTER TABLE users ADD COLUMN fmcsa_account_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN fmcsa_verification_date TEXT;
ALTER TABLE users ADD COLUMN last_credential_update TEXT;
*/

-- ============================================================================
-- EMPLOYEE IDENTITY DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_identity_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    
    -- ID Document Details
    id_document_type TEXT NOT NULL,  -- 'drivers_license', 'passport', 'state_id'
    id_document_number TEXT,         -- DL number, passport number, etc. (encrypted)
    id_expiration_date TEXT,
    
    -- Personal Information (for verification matching)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    date_of_birth TEXT NOT NULL,
    
    -- File Paths
    id_document_front_path TEXT NOT NULL,  -- Front of ID
    id_document_back_path TEXT,             -- Back of ID (if applicable)
    selfie_path TEXT,                       -- Selfie for verification
    
    -- IDEMIA Verification Status
    idemia_verification_status TEXT DEFAULT 'not_verified',  
    -- Possible values: 'not_verified', 'pending', 'verified', 'failed', 'expired'
    idemia_verification_date TEXT,
    idemia_verification_id TEXT,           -- External IDEMIA reference ID
    idemia_verification_result TEXT,       -- JSON with verification details
    idemia_failure_reason TEXT,
    
    -- Metadata
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,           -- Can have multiple IDs, but only one active
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_identity_employee_id ON employee_identity_documents(employee_id);
CREATE INDEX idx_employee_identity_verification_status ON employee_identity_documents(idemia_verification_status);
CREATE INDEX idx_employee_identity_active ON employee_identity_documents(employee_id, is_active);

-- ============================================================================
-- ADMIN IDEMIA VERIFICATIONS (Tracking verification sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_idemia_verifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    deal_id TEXT,                          -- If verification happened during a deal
    rpa_instance_id TEXT,                  -- If verification happened during RPA
    
    -- Verification Details
    verification_type TEXT NOT NULL,       -- 'initial', 'renewal', 'reverification'
    verification_method TEXT DEFAULT 'idemia',  -- 'idemia', 'manual', 'skip_already_verified'
    
    -- Status
    status TEXT DEFAULT 'pending',         -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
    started_at TEXT NOT NULL,
    completed_at TEXT,
    
    -- IDEMIA Session Details
    idemia_session_id TEXT,
    idemia_session_url TEXT,
    idemia_result TEXT,                    -- JSON with full result
    
    -- Admin Actions
    admin_id TEXT,                         -- Which admin performed verification
    admin_notes TEXT,
    manual_override INTEGER DEFAULT 0,     -- If admin manually approved
    
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

-- ============================================================================
-- CREDENTIAL ACCESS LOG (Audit trail for credential access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS credential_access_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    
    -- What was accessed
    employee_id TEXT NOT NULL,
    credential_type TEXT NOT NULL,  -- 'login_gov_username', 'login_gov_password', 'id_document'
    
    -- Who/What accessed it
    accessed_by_type TEXT NOT NULL,  -- 'user', 'rpa_agent', 'system'
    accessed_by_id TEXT,             -- User ID or RPA instance ID
    
    -- Context
    purpose TEXT NOT NULL,           -- 'rpa_filing', 'admin_view', 'credential_update', 'verification'
    deal_id TEXT,                    -- If related to a deal
    rpa_instance_id TEXT,            -- If accessed by RPA
    
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

-- ============================================================================
-- CREDENTIAL ROTATION SCHEDULE (For password rotation policies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS credential_rotation_schedule (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    
    -- Rotation Policy
    credential_type TEXT NOT NULL,   -- 'login_gov_password', 'id_document'
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

-- ============================================================================
-- RPA AUDIT TRAIL (Immutable log of all RPA actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rpa_audit_trail (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    
    -- Action Details
    action_type TEXT NOT NULL,  
    -- Possible values: 'page_load', 'field_fill', 'button_click', 'document_upload', 
    --                  'checkpoint', 'error', 'credential_access', 'verification'
    
    -- Context
    deal_id TEXT NOT NULL,
    employee_id TEXT,
    rpa_instance_id TEXT NOT NULL,
    
    -- Page/Step Information
    page_number INTEGER,
    page_url TEXT,
    field_name TEXT,
    field_value_hash TEXT,  -- Hashed for privacy (never store actual values)
    
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
-- INITIAL DATA / EXAMPLES
-- ============================================================================

-- Example: Set up credential rotation for admin user
-- (Run after user creation)
/*
INSERT INTO credential_rotation_schedule (
    id,
    employee_id,
    credential_type,
    rotation_frequency_days,
    last_rotated,
    next_rotation_due,
    is_active
) VALUES (
    'rotation_' || hex(randomblob(8)),
    'admin_user_id',
    'login_gov_password',
    90,
    datetime('now'),
    datetime('now', '+90 days'),
    1
);
*/

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

/*
IMPORTANT SECURITY NOTES:

1. ENCRYPTION:
   - All login_gov_password fields MUST be encrypted using EncryptionService
   - All id_document_number fields MUST be encrypted
   - Never log or display encrypted passwords in plaintext
   
2. ACCESS CONTROL:
   - Only allow admins to view/edit Login.gov credentials
   - Log every access to credentials in credential_access_log
   - Implement rate limiting on credential access
   
3. AUDIT TRAIL:
   - rpa_audit_trail is APPEND-ONLY (never UPDATE or DELETE)
   - Screenshot every page for regulatory compliance
   - Hash PII before storing in audit logs
   
4. ROTATION:
   - Implement automated reminders for credential rotation
   - Force rotation after 90 days for security
   - Alert if credentials are overdue
   
5. IDEMIA VERIFICATION:
   - Store verification results permanently
   - Never re-verify if already verified (unless expired)
   - Keep audit trail of all verification attempts
*/

-- ============================================================================
-- MIGRATION FROM EXISTING SCHEMA
-- ============================================================================

/*
To add these columns to existing users table, run:

-- Add Login.gov credentials
ALTER TABLE users ADD COLUMN login_gov_username TEXT;
ALTER TABLE users ADD COLUMN login_gov_password_encrypted TEXT;
ALTER TABLE users ADD COLUMN login_gov_mfa_method TEXT DEFAULT 'sms';
ALTER TABLE users ADD COLUMN login_gov_mfa_phone TEXT;
ALTER TABLE users ADD COLUMN login_gov_backup_codes_encrypted TEXT;
ALTER TABLE users ADD COLUMN fmcsa_account_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN fmcsa_verification_date TEXT;
ALTER TABLE users ADD COLUMN last_credential_update TEXT;

Then create all new tables above.
*/

