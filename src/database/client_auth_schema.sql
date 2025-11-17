-- Client Portal Authentication Schema
-- This table stores client portal user credentials separate from internal CRM users

CREATE TABLE IF NOT EXISTS client_users (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    contact_id TEXT, -- Reference to contacts table (optional)
    
    -- Authentication
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- bcrypt hashed password
    
    -- User Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    
    -- Access Control
    role TEXT DEFAULT 'client', -- 'client', 'primary', 'secondary'
    is_active INTEGER DEFAULT 1, -- 0 = disabled, 1 = active
    email_verified INTEGER DEFAULT 0, -- 0 = not verified, 1 = verified
    
    -- Permissions
    can_view_services INTEGER DEFAULT 1,
    can_view_invoices INTEGER DEFAULT 1,
    can_make_payments INTEGER DEFAULT 1,
    can_submit_requests INTEGER DEFAULT 1,
    can_view_documents INTEGER DEFAULT 1,
    
    -- Session Management
    last_login TEXT,
    last_login_ip TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT, -- Account lockout timestamp
    
    -- Password Reset
    reset_token TEXT,
    reset_token_expires TEXT,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT, -- Admin user who created this client user
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_users_email ON client_users(email);
CREATE INDEX IF NOT EXISTS idx_client_users_company ON client_users(company_id);
CREATE INDEX IF NOT EXISTS idx_client_users_active ON client_users(is_active);

-- Client Sessions table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS client_user_sessions (
    id TEXT PRIMARY KEY,
    client_user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (client_user_id) REFERENCES client_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_client_sessions_token ON client_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_client_sessions_user ON client_user_sessions(client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_sessions_expires ON client_user_sessions(expires_at);









