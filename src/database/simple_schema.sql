-- Simple schema for Rapid CRM
-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    job_title TEXT,
    department TEXT,
    is_primary_contact INTEGER DEFAULT 0,
    preferred_contact_method TEXT DEFAULT 'Phone',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    vin TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    vehicle_type TEXT NOT NULL,
    gvwr TEXT NOT NULL,
    fuel_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    license_class TEXT NOT NULL,
    license_expiry TEXT,
    phone TEXT,
    email TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value REAL,
    stage TEXT NOT NULL,
    probability INTEGER DEFAULT 0,
    expected_close_date TEXT,
    actual_close_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    due_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    due_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- AI Collaboration Messages table
CREATE TABLE IF NOT EXISTS ai_collaboration_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    from_ai TEXT NOT NULL,
    to_ai TEXT NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT,
    status TEXT DEFAULT 'sent',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON contacts(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_from_to ON ai_collaboration_messages(from_ai, to_ai);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_collaboration_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_collaboration_messages(created_at);






